const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordControllerEnhanced");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
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

// Apply authentication to all routes
router.use(authenticate);

// === BASIC CRUD OPERATIONS ===

// Get all financial records
router.get("/", authorize("Analyst", "Admin"), recordController.getAllRecords);

// Get record by ID
router.get(
  "/:id",
  authorize("Analyst", "Admin"),
  recordController.getRecordById,
);

// Get records by user
router.get("/user/:userId", recordController.getRecordsByUser);

// Create a new financial record
router.post(
  "/",
  authorize("Analyst", "Admin"),
  [
    body("transactionId").notEmpty().withMessage("Transaction ID is required"),
    body("type")
      .isIn(["income", "expense", "transfer"])
      .withMessage("Invalid transaction type"),
    body("category").notEmpty().withMessage("Category is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
  ],
  handleValidationErrors,
  recordController.createRecord,
);

// Update financial record
router.put(
  "/:id",
  authorize("Analyst", "Admin"),
  recordController.updateRecord,
);

// Delete financial record (Admin only)
router.delete("/:id", authorize("Admin"), recordController.deleteRecord);

// === ADVANCED SEARCH & FILTERING ===

// Advanced search with multiple filters
router.get(
  "/search/advanced",
  authorize("Analyst", "Admin"),
  recordController.searchRecords,
);

// === BULK OPERATIONS ===

// Create multiple records
router.post(
  "/bulk/create",
  authorize("Analyst", "Admin"),
  [body().isArray().withMessage("Request body must be an array of records")],
  handleValidationErrors,
  recordController.createMultipleRecords,
);

// Delete multiple records (Admin only)
router.post(
  "/bulk/delete",
  authorize("Admin"),
  [body("recordIds").isArray().withMessage("Record IDs must be an array")],
  handleValidationErrors,
  recordController.deleteMultipleRecords,
);

// === EXPORT FEATURES ===

// Export records as CSV
router.get(
  "/export/csv",
  authorize("Analyst", "Admin"),
  recordController.exportRecordsAsCSV,
);

// Export records as JSON
router.get(
  "/export/json",
  authorize("Analyst", "Admin"),
  recordController.exportRecordsAsJSON,
);

// === STATISTICS & ANALYTICS ===

// Get record statistics
router.get(
  "/stats/overview",
  authorize("Analyst", "Admin"),
  recordController.getRecordStatistics,
);

// Find duplicate records
router.get(
  "/stats/duplicates",
  authorize("Admin"),
  recordController.findDuplicateRecords,
);

// Get available categories
router.get(
  "/data/categories",
  authorize("Analyst", "Admin"),
  recordController.getCategories,
);

// Get available tags
router.get(
  "/data/tags",
  authorize("Analyst", "Admin"),
  recordController.getTags,
);

module.exports = router;
