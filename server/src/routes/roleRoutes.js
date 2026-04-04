const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

/**
 * POST /roles/init
 * Initialize default roles in database (call this once on setup)
 * No authentication required for initial setup
 */
router.post("/init", roleController.initializeDefaultRoles);

// Apply authentication to remaining routes
router.use(authenticate);

/**
 * GET /roles
 * Get all available roles
 */
router.get("/", roleController.getAllRoles);

/**
 * GET /roles/:name
 * Get details for a specific role and its permissions
 * Example: GET /roles/Admin
 */
router.get("/details/:name", roleController.getRoleDetails);

/**
 * GET /roles/permissions/:roleName
 * Get all permissions for a specific role
 * Example: GET /roles/permissions/Analyst
 */
router.get("/permissions/:roleName", roleController.getRolePermissions);

module.exports = router;
