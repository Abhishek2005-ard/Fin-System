const Role = require("../models/Role");
const {
  ROLE_PERMISSIONS,
  getAvailableRoles,
} = require("../utils/rolePermissions");

/**
 * GET /roles
 * Get all available roles
 */
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();

    // If no roles exist, return the predefined roles
    if (roles.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No roles in database. Here are the predefined roles:",
        data: getAvailableRoles(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Roles retrieved successfully",
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving roles",
      error: error.message,
    });
  }
};

/**
 * GET /roles/:name
 * Get a specific role by name and its permissions
 */
exports.getRoleDetails = async (req, res) => {
  try {
    const roleName = req.params.name;

    // Check if role exists in predefined roles
    if (!ROLE_PERMISSIONS[roleName]) {
      return res.status(404).json({
        success: false,
        message: `Role "${roleName}" not found`,
      });
    }

    const roleInfo = ROLE_PERMISSIONS[roleName];

    res.status(200).json({
      success: true,
      message: `Role "${roleName}" details retrieved successfully`,
      data: {
        name: roleName,
        description: roleInfo.description,
        permissions: roleInfo.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving role details",
      error: error.message,
    });
  }
};

/**
 * POST /roles/init
 * Initialize default roles in the database
 * Call this once when setting up the system
 */
exports.initializeDefaultRoles = async (req, res) => {
  try {
    // Check if roles already exist
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      return res.status(400).json({
        success: false,
        message: "Roles already initialized in database",
      });
    }

    // Define the three default roles with their descriptions
    const defaultRoles = [
      {
        name: "Viewer",
        description: "Can only view dashboard data",
      },
      {
        name: "Analyst",
        description: "Can view records and access insights",
      },
      {
        name: "Admin",
        description: "Full access - can manage everything",
      },
    ];

    // Save all default roles
    const savedRoles = await Role.insertMany(defaultRoles);

    res.status(201).json({
      success: true,
      message: "Default roles initialized successfully",
      count: savedRoles.length,
      data: savedRoles.map((role) => ({
        name: role.name,
        description: role.description,
        permissions: ROLE_PERMISSIONS[role.name].permissions,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error initializing default roles",
      error: error.message,
    });
  }
};

/**
 * GET /roles/permissions/:roleName
 * Get all permissions for a specific role
 */
exports.getRolePermissions = async (req, res) => {
  try {
    const roleName = req.params.roleName;

    // Check if role exists
    if (!ROLE_PERMISSIONS[roleName]) {
      return res.status(404).json({
        success: false,
        message: `Role "${roleName}" not found`,
      });
    }

    const permissions = ROLE_PERMISSIONS[roleName].permissions;

    res.status(200).json({
      success: true,
      message: `Permissions for role "${roleName}" retrieved successfully`,
      data: {
        role: roleName,
        permissions: permissions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving role permissions",
      error: error.message,
    });
  }
};
