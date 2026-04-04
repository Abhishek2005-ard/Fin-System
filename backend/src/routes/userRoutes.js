const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authenticate");
const checkPermission = require("../middleware/checkPermission");
const { body, param, validationResult } = require("express-validator");

/**
 * Middleware to handle validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// Apply authentication to all user routes
router.use(authenticate);

/**
 * GET /users
 * Get all users (requires manageUsers permission)
 */
router.get("/", checkPermission("manageUsers"), userController.getAllUsers);

/**
 * GET /users/:id
 * Get a specific user by ID (requires manageUsers permission)
 */
router.get(
  "/:id",
  checkPermission("manageUsers"),
  [param("id").isMongoId().withMessage("Invalid user ID format")],
  handleValidationErrors,
  userController.getUserById,
);

/**
 * POST /users
 * Create a new user (requires manageUsers permission)
 * Body: { name, email, password, role, status }
 */
router.post(
  "/",
  checkPermission("manageUsers"),
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["Viewer", "Analyst", "Admin"])
      .withMessage("Role must be Viewer, Analyst, or Admin"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
  ],
  handleValidationErrors,
  userController.createUser,
);

/**
 * PUT /users/:id
 * Update user details (requires manageUsers permission)
 * Body: { name, email, role, status }
 */
router.put(
  "/:id",
  checkPermission("manageUsers"),
  [
    param("id").isMongoId().withMessage("Invalid user ID format"),
    body("name")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 characters"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("role")
      .optional()
      .isIn(["Viewer", "Analyst", "Admin"])
      .withMessage("Role must be Viewer, Analyst, or Admin"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
  ],
  handleValidationErrors,
  userController.updateUser,
);

/**
 * DELETE /users/:id
 * Delete a user (requires manageUsers permission)
 */
router.delete(
  "/:id",
  checkPermission("manageUsers"),
  [param("id").isMongoId().withMessage("Invalid user ID format")],
  handleValidationErrors,
  userController.deleteUser,
);

/**
 * PATCH /users/:id/status
 * Change user's active/inactive status (requires manageUsers permission)
 * Body: { status: "active" or "inactive" }
 */
router.patch(
  "/:id/status",
  checkPermission("manageUsers"),
  [
    param("id").isMongoId().withMessage("Invalid user ID format"),
    body("status")
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
  ],
  handleValidationErrors,
  userController.changeUserStatus,
);

module.exports = router;
