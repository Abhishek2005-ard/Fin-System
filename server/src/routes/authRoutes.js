const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
  }
  next();
};

// Register endpoint
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["Viewer", "Analyst", "Admin"]).withMessage("Invalid role"),
  ],
  handleValidationErrors,
  authController.register,
);

// Login endpoint
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  authController.login,
);

module.exports = router;
