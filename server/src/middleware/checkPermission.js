const User = require("../models/User");
const { hasPermission } = require("../utils/rolePermissions");

/**
 * Middleware to check if user has required permission(s)
 * Usage: router.get("/records", checkPermission("viewRecords"), controller)
 * Usage: router.post("/records", checkPermission("createRecords"), controller)
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Get user from request (set by authenticate middleware)
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user's role has the required permission
      if (!hasPermission(user.role, requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${requiredPermission}`,
        });
      }

      // Store user info for use in controller
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      };

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Permission check error",
        error: error.message,
      });
    }
  };
};

module.exports = checkPermission;
