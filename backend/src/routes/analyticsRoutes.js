const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authenticate = require("../middleware/authenticate");
const checkPermission = require("../middleware/checkPermission");
const { query, validationResult } = require("express-validator");

// Middleware to handle validation errors
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

// Apply authentication to all routes
router.use(authenticate);

// Get summary analytics (requires accessInsights permission)
router.get(
  "/summary",
  checkPermission("accessInsights"),
  [
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be in ISO format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be in ISO format"),
  ],
  handleValidationErrors,
  analyticsController.getSummaryAnalytics,
);

// Get category breakdown (requires accessInsights permission)
router.get(
  "/category-breakdown",
  checkPermission("accessInsights"),
  [
    query("type")
      .optional()
      .isIn(["income", "expense", "transfer"])
      .withMessage("Type must be income, expense, or transfer"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be in ISO format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be in ISO format"),
  ],
  handleValidationErrors,
  analyticsController.getCategoryBreakdown,
);

// Get monthly trends (requires accessInsights permission)
router.get(
  "/monthly-trends",
  checkPermission("accessInsights"),
  [
    query("year")
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Year must be between 2000 and 2100"),
    query("type")
      .optional()
      .isIn(["income", "expense", "transfer"])
      .withMessage("Type must be income, expense, or transfer"),
  ],
  handleValidationErrors,
  analyticsController.getMonthlyTrends,
);

// Get weekly trends (requires accessInsights permission)
router.get(
  "/weekly-trends",
  checkPermission("accessInsights"),
  [
    query("year")
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Year must be between 2000 and 2100"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be in ISO format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be in ISO format"),
    query("type")
      .optional()
      .isIn(["income", "expense", "transfer"])
      .withMessage("Type must be income, expense, or transfer"),
  ],
  handleValidationErrors,
  analyticsController.getWeeklyTrends,
);

// Get transaction status distribution (requires accessInsights permission)
router.get(
  "/transaction-status",
  checkPermission("accessInsights"),
  [
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be in ISO format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be in ISO format"),
  ],
  handleValidationErrors,
  analyticsController.getTransactionStatusDistribution,
);

// Get basic dashboard (requires viewDashboard permission)
router.get(
  "/basic-dashboard",
  checkPermission("viewDashboard"),
  analyticsController.getBasicDashboard,
);

// Get dashboard overview (requires accessInsights permission)
router.get(
  "/dashboard-overview",
  checkPermission("accessInsights"),
  [
    query("days")
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage("Days must be between 1 and 365"),
  ],
  handleValidationErrors,
  analyticsController.getDashboardOverview,
);

module.exports = router;
