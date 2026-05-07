const express = require("express");
const FinancialRecord = require("../models/financialRecord.model");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// 1. SUMMARY → total income, total expense, net balance
router.get(
  "/summary",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  async (req, res) => {
    try {
      const summary = await FinancialRecord.aggregate([
        {
          // Step 1: group all records by type
          $group: {
            _id: "$type", // group by income or expense
            total: { $sum: "$amount" }, // sum all amounts in each group
          },
        },
      ]);

      // summary will look like:
      // [ { _id: "income", total: 50000 }, { _id: "expense", total: 20000 } ]

      // convert array into clean object
      let totalIncome = 0;
      let totalExpense = 0;

      summary.forEach((item) => {
        if (item._id === "income") {
          totalIncome = item.total;
        } else if (item._id === "expense") {
          totalExpense = item.total;
        }
      });

      const netBalance = totalIncome - totalExpense;

      res.status(200).json({
        message: "Summary fetched successfully.",
        data: {
          totalIncome,
          totalExpense,
          netBalance,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary." });
    }
  },
);

// 2. CATEGORY WISE TOTALS
router.get(
  "/category-wise",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  async (req, res) => {
    try {
      const categoryData = await FinancialRecord.aggregate([
        {
          // Step 1: group by category and sum amounts
          $group: {
            _id: "$category", // group by category name
            total: { $sum: "$amount" }, // sum amounts per category
            count: { $sum: 1 }, // count records per category
          },
        },
        {
          // Step 2: sort by total descending (highest first)
          $sort: { total: -1 },
        },
      ]);

      if (categoryData.length === 0) {
        return res.status(404).json({ error: "No category data found." });
      }

      res.status(200).json({
        message: "Category wise data fetched successfully.",
        data: categoryData,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category wise data." });
    }
  },
);

// 3. RECENT TRANSACTIONS → last 5
router.get(
  "/recent",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  async (req, res) => {
    try {
      const recentRecords = await FinancialRecord.find()
        .sort({ date: -1 }) // newest first
        .limit(5); // only last 5

      if (recentRecords.length === 0) {
        return res.status(404).json({ error: "No recent records found." });
      }

      res.status(200).json({
        message: "Recent transactions fetched successfully.",
        data: recentRecords,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent transactions." });
    }
  },
);

// 4. MONTHLY TRENDS
router.get(
  "/monthly-trends",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  async (req, res) => {
    try {
      const monthlyData = await FinancialRecord.aggregate([
        {
          // Step 1: group by year + month + type
          $group: {
            _id: {
              year: { $year: "$date" }, // extract year from date
              month: { $month: "$date" }, // extract month from date
              type: "$type", // income or expense
            },
            total: { $sum: "$amount" },
          },
        },
        {
          // Step 2: sort by year and month
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      if (monthlyData.length === 0) {
        return res.status(404).json({ error: "No monthly data found." });
      }

      res.status(200).json({
        message: "Monthly trends fetched successfully.",
        data: monthlyData,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly trends." });
    }
  },
);

module.exports = router;
