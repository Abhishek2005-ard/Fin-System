const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const authenticate = require("../middleware/authenticate");
const checkPermission = require("../middleware/checkPermission");
const { body, param, query, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Apply authentication to all routes
router.use(authenticate);

// Get all financial records (requires viewRecords permission)
router.get("/",
  checkPermission("viewRecords"),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer'),
    query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Status must be pending, completed, or failed')
  ],
  handleValidationErrors,
  recordController.getAllRecords
);

// Get record by ID (requires viewRecords permission)
router.get(
  "/:id",
  checkPermission("viewRecords"),
  [
    param('id').isMongoId().withMessage('Invalid record ID format')
  ],
  handleValidationErrors,
  recordController.getRecordById,
);

// Get records by user (requires viewRecords permission)
router.get(
  "/user/:userId",
  checkPermission("viewRecords"),
  [
    param('userId').isMongoId().withMessage('Invalid user ID format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  recordController.getRecordsByUser,
);

// Create a new financial record (requires createRecords permission)
router.post(
  "/",
  checkPermission("createRecords"),
  [
    body("transactionId").notEmpty().withMessage("Transaction ID is required").isLength({ min: 1, max: 50 }).withMessage("Transaction ID must be 1-50 characters"),
    body("type").isIn(["income", "expense", "transfer"]).withMessage("Type must be income, expense, or transfer"),
    body("category").notEmpty().withMessage("Category is required").isLength({ min: 1, max: 100 }).withMessage("Category must be 1-100 characters"),
    body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be a positive number greater than 0"),
    body("currency").optional().isLength({ min: 3, max: 3 }).withMessage("Currency must be 3 characters"),
    body("description").optional().isLength({ max: 500 }).withMessage("Description must be less than 500 characters"),
    body("date").optional().isISO8601().withMessage("Date must be in ISO format"),
    body("status").optional().isIn(["pending", "completed", "failed"]).withMessage("Status must be pending, completed, or failed"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("attachment").optional().isURL().withMessage("Attachment must be a valid URL")
  ],
  handleValidationErrors,
  recordController.createRecord,
);

// Update financial record (requires updateRecords permission)
router.put(
  "/:id",
  checkPermission("updateRecords"),
  [
    param('id').isMongoId().withMessage('Invalid record ID format'),
    body("type").optional().isIn(["income", "expense", "transfer"]).withMessage("Type must be income, expense, or transfer"),
    body("category").optional().isLength({ min: 1, max: 100 }).withMessage("Category must be 1-100 characters"),
    body("amount").optional().isFloat({ min: 0.01 }).withMessage("Amount must be a positive number greater than 0"),
    body("currency").optional().isLength({ min: 3, max: 3 }).withMessage("Currency must be 3 characters"),
    body("description").optional().isLength({ max: 500 }).withMessage("Description must be less than 500 characters"),
    body("date").optional().isISO8601().withMessage("Date must be in ISO format"),
    body("status").optional().isIn(["pending", "completed", "failed"]).withMessage("Status must be pending, completed, or failed"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("attachment").optional().isURL().withMessage("Attachment must be a valid URL")
  ],
  handleValidationErrors,
  recordController.updateRecord,
);

// Delete financial record (requires deleteRecords permission)
router.delete(
  "/:id",
  checkPermission("deleteRecords"),
  [
    param('id').isMongoId().withMessage('Invalid record ID format')
  ],
  handleValidationErrors,
  recordController.deleteRecord,
);

module.exports = router;
