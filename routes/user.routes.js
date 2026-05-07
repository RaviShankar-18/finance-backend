const express = require("express");
const User = require("../models/user.model");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// GET ALL USERS → admin only
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password"); // don't send password

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found." });
    }

    res.status(200).json({
      message: "Users fetched successfully.",
      total: users.length,
      users: users,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// GET SINGLE USER → admin only
router.get(
  "/:userId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(200).json({
        message: "User fetched successfully.",
        user: user,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user." });
    }
  },
);

// UPDATE USER ROLE → admin only
router.patch(
  "/:userId/role",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { role } = req.body;

      // check role is provided
      if (!role) {
        return res.status(400).json({ error: "Please provide role." });
      }

      // check role is valid
      const validRoles = ["admin", "analyst", "viewer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: "Invalid role. Must be admin, analyst, or viewer.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { role: role },
        { new: true },
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(200).json({
        message: "User role updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role." });
    }
  },
);

// UPDATE USER STATUS → deactivate/activate user
router.patch(
  "/:userId/status",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { isActive } = req.body;

      // check isActive is provided
      if (isActive === undefined) {
        return res.status(400).json({
          error: "Please provide isActive status (true or false).",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { isActive: isActive },
        { new: true },
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found." });
      }

      const statusMessage = isActive
        ? "User activated successfully."
        : "User deactivated successfully.";

      res.status(200).json({
        message: statusMessage,
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status." });
    }
  },
);

module.exports = router;
