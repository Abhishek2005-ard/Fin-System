const User = require("../models/User");

/**
 * Middleware to check if user has required role(s)
 * Usage: router.get("/admin", authorize("Admin"), controller)
 * Usage: router.get("/manage", authorize("Admin", "Analyst"), controller)
 */
const authorize = (...allowedRoles) => {
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

      // Check if user's role is in the allowed roles list
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
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
        message: "Authorization error",
        error: error.message,
      });
    }
  };
};

module.exports = authorize;
