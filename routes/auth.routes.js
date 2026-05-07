// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model");

// const router = express.Router();

// // REGISTER
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Step 1: check all fields are given
//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ error: "Please provide all required fields." });
//     }

//     // Step 2: check if user already exists
//     const existingUser = await User.findOne({ email: email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ error: "User already exists with this email." });
//     }

//     // Step 3: hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Step 4: create and save new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     const savedUser = await newUser.save();

//     res.status(201).json({
//       message: "User registered successfully.",
//       user: {
//         id: savedUser._id,
//         name: savedUser.name,
//         email: savedUser.email,
//         role: savedUser.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to register user." });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Step 1: check fields given
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ error: "Please provide email and password." });
//     }

//     // Step 2: check user exists
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     // Step 3: check if user is active
//     if (!user.isActive) {
//       return res
//         .status(403)
//         .json({ error: "Your account has been deactivated." });
//     }

//     // Step 4: check password matches
//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(401).json({ error: "Invalid credentials." });
//     }

//     // Step 5: create JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" },
//     );

//     res.status(200).json({
//       message: "Login successful.",
//       token: token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to login." });
//   }
// });

// module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { validateEmail, validatePassword } = require("../utils/validators");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Step 1: check all fields are given
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // Step 2: validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address." });
    }

    // Step 3: validate password length
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // Step 4: check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email." });
    }

    // Step 5: validate role if provided
    if (role) {
      const validRoles = ["admin", "analyst", "viewer"];
      if (!validRoles.includes(role)) {
        return res
          .status(400)
          .json({ error: "Invalid role. Must be admin, analyst, or viewer." });
      }
    }

    // Step 6: hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 7: create and save new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "viewer",
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: check fields given
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password." });
    }

    // Step 2: validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address." });
    }

    // Step 3: check user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Step 4: check if user is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: "Your account has been deactivated." });
    }

    // Step 5: check password matches
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Step 6: create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login successful.",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to login." });
  }
});

module.exports = router;
