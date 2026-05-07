// const express = require("express");
// const FinancialRecord = require("../models/financialRecord.model");
// const { verifyToken } = require("../middleware/auth.middleware");
// const { authorizeRoles } = require("../middleware/role.middleware");

// const router = express.Router();

// // CREATE a record → admin only
// router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
//   try {
//     const { amount, type, category, date, description } = req.body;

//     // check required fields
//     if (!amount || !type || !category || !date) {
//       return res.status(400).json({
//         error: "Please provide amount, type, category and date.",
//       });
//     }

//     const newRecord = new FinancialRecord({
//       amount,
//       type,
//       category,
//       date,
//       description,
//       createdBy: req.user.id, // ← comes from token via auth middleware
//     });

//     const savedRecord = await newRecord.save();

//     res.status(201).json({
//       message: "Financial record created successfully.",
//       record: savedRecord,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create financial record." });
//   }
// });

// // GET all records → all logged in users
// // also supports filters: type, category, date
// router.get(
//   "/",
//   verifyToken,
//   authorizeRoles("admin", "analyst", "viewer"),
//   async (req, res) => {
//     try {
//       // get filters from query params
//       const { type, category, date } = req.query;

//       // build filter object dynamically
//       let filters = {};

//       if (type) {
//         filters.type = type;
//       }

//       if (category) {
//         filters.category = category;
//       }

//       if (date) {
//         // get all records of that specific date
//         const startDate = new Date(date);
//         const endDate = new Date(date);
//         endDate.setDate(endDate.getDate() + 1);

//         filters.date = {
//           $gte: startDate, // greater than or equal to start
//           $lt: endDate, // less than end (next day)
//         };
//       }

//       const records = await FinancialRecord.find(filters).sort({
//         date: -1, // newest first
//       });

//       if (records.length === 0) {
//         return res.status(404).json({ error: "No records found." });
//       }

//       res.status(200).json({
//         message: "Records fetched successfully.",
//         total: records.length,
//         records: records,
//       });
//     } catch (error) {
//       res.status(500).json({ error: "Failed to fetch records." });
//     }
//   },
// );

// // GET single record by id → all logged in users
// router.get(
//   "/:recordId",
//   verifyToken,
//   authorizeRoles("admin", "analyst", "viewer"),
//   async (req, res) => {
//     try {
//       const record = await FinancialRecord.findById(req.params.recordId);

//       if (!record) {
//         return res.status(404).json({ error: "Record not found." });
//       }

//       res.status(200).json({
//         message: "Record fetched successfully.",
//         record: record,
//       });
//     } catch (error) {
//       res.status(500).json({ error: "Failed to fetch record." });
//     }
//   },
// );

// // UPDATE a record → admin only
// router.put(
//   "/:recordId",
//   verifyToken,
//   authorizeRoles("admin"),
//   async (req, res) => {
//     try {
//       const updatedRecord = await FinancialRecord.findByIdAndUpdate(
//         req.params.recordId,
//         req.body,
//         { new: true }, // return updated record
//       );

//       if (!updatedRecord) {
//         return res.status(404).json({ error: "Record not found." });
//       }

//       res.status(200).json({
//         message: "Record updated successfully.",
//         record: updatedRecord,
//       });
//     } catch (error) {
//       res.status(500).json({ error: "Failed to update record." });
//     }
//   },
// );

// // DELETE a record → admin only
// router.delete(
//   "/:recordId",
//   verifyToken,
//   authorizeRoles("admin"),
//   async (req, res) => {
//     try {
//       const deletedRecord = await FinancialRecord.findByIdAndDelete(
//         req.params.recordId,
//       );

//       if (!deletedRecord) {
//         return res.status(404).json({ error: "Record not found." });
//       }

//       res.status(200).json({
//         message: "Record deleted successfully.",
//         record: deletedRecord,
//       });
//     } catch (error) {
//       res.status(500).json({ error: "Failed to delete record." });
//     }
//   },
// );

// module.exports = router;

const express = require("express");
const FinancialRecord = require("../models/financialRecord.model");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const {
  validateAmount,
  validateType,
  validateDate,
} = require("../utils/validators");

const router = express.Router();

// CREATE a record → admin only
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;

    // check required fields
    if (!amount || !type || !category || !date) {
      return res.status(400).json({
        error: "Please provide amount, type, category, and date.",
      });
    }

    // validate amount is positive number
    if (!validateAmount(amount)) {
      return res.status(400).json({
        error: "Amount must be a positive number.",
      });
    }

    // validate type is income or expense
    if (!validateType(type)) {
      return res.status(400).json({
        error: "Type must be either 'income' or 'expense'.",
      });
    }

    // validate category is not empty
    if (typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({
        error: "Category must be a non-empty string.",
      });
    }

    // validate date format
    if (!validateDate(date)) {
      return res.status(400).json({
        error: "Please provide a valid date (format: YYYY-MM-DD).",
      });
    }

    const newRecord = new FinancialRecord({
      amount,
      type,
      category: category.trim(),
      date,
      description,
      createdBy: req.user.id,
    });

    const savedRecord = await newRecord.save();

    res.status(201).json({
      message: "Financial record created successfully.",
      record: savedRecord,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create financial record." });
  }
});

// GET all records → all logged in users (rest of code stays same)
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "analyst", "viewer"),
  async (req, res) => {
    try {
      const { type, category, date } = req.query;

      let filters = {};

      // validate type if provided
      if (type) {
        if (!validateType(type)) {
          return res.status(400).json({
            error: "Type must be either 'income' or 'expense'.",
          });
        }
        filters.type = type;
      }

      if (category) {
        filters.category = category;
      }

      if (date) {
        // validate date format
        if (!validateDate(date)) {
          return res.status(400).json({
            error: "Please provide a valid date (format: YYYY-MM-DD).",
          });
        }

        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        filters.date = {
          $gte: startDate,
          $lt: endDate,
        };
      }

      const records = await FinancialRecord.find(filters).sort({
        date: -1,
      });

      if (records.length === 0) {
        return res.status(404).json({ error: "No records found." });
      }

      res.status(200).json({
        message: "Records fetched successfully.",
        total: records.length,
        records: records,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch records." });
    }
  },
);

// GET single record (no changes needed)
router.get(
  "/:recordId",
  verifyToken,
  authorizeRoles("admin", "analyst", "viewer"),
  async (req, res) => {
    try {
      const record = await FinancialRecord.findById(req.params.recordId);

      if (!record) {
        return res.status(404).json({ error: "Record not found." });
      }

      res.status(200).json({
        message: "Record fetched successfully.",
        record: record,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch record." });
    }
  },
);

// UPDATE record
router.put(
  "/:recordId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { amount, type, category, date } = req.body;

      // validate each field if provided
      if (amount !== undefined && !validateAmount(amount)) {
        return res.status(400).json({
          error: "Amount must be a positive number.",
        });
      }

      if (type !== undefined && !validateType(type)) {
        return res.status(400).json({
          error: "Type must be either 'income' or 'expense'.",
        });
      }

      if (
        category !== undefined &&
        (typeof category !== "string" || category.trim() === "")
      ) {
        return res.status(400).json({
          error: "Category must be a non-empty string.",
        });
      }

      if (date !== undefined && !validateDate(date)) {
        return res.status(400).json({
          error: "Please provide a valid date (format: YYYY-MM-DD).",
        });
      }

      const updatedRecord = await FinancialRecord.findByIdAndUpdate(
        req.params.recordId,
        req.body,
        { new: true },
      );

      if (!updatedRecord) {
        return res.status(404).json({ error: "Record not found." });
      }

      res.status(200).json({
        message: "Record updated successfully.",
        record: updatedRecord,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update record." });
    }
  },
);

// DELETE record (no changes needed)
router.delete(
  "/:recordId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const deletedRecord = await FinancialRecord.findByIdAndDelete(
        req.params.recordId,
      );

      if (!deletedRecord) {
        return res.status(404).json({ error: "Record not found." });
      }

      res.status(200).json({
        message: "Record deleted successfully.",
        record: deletedRecord,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete record." });
    }
  },
);

module.exports = router;
