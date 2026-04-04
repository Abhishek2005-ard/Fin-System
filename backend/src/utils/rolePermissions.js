// Define roles and their permissions
// This is the single source of truth for role-based access control

const ROLES = {
  VIEWER: "Viewer",
  ANALYST: "Analyst",
  ADMIN: "Admin",
};

// Permission definitions for each role
const ROLE_PERMISSIONS = {
  Viewer: {
    description: "Can only view dashboard data",
    permissions: {
      viewDashboard: true,
      viewRecords: false,
      accessInsights: false,
      createRecords: false,
      updateRecords: false,
      deleteRecords: false,
      manageUsers: false,
      manageRoles: false,
    },
  },
  Analyst: {
    description: "Can view records and access insights",
    permissions: {
      viewDashboard: true,
      viewRecords: true,
      accessInsights: true,
      createRecords: false,
      updateRecords: false,
      deleteRecords: false,
      manageUsers: false,
      manageRoles: false,
    },
  },
  Admin: {
    description: "Full access - can manage everything",
    permissions: {
      viewDashboard: true,
      viewRecords: true,
      accessInsights: true,
      createRecords: true,
      updateRecords: true,
      deleteRecords: true,
      manageUsers: true,
      manageRoles: true,
    },
  },
};

// Helper function to check if a role has a specific permission
const hasPermission = (roleName, permission) => {
  if (!ROLE_PERMISSIONS[roleName]) {
    return false;
  }
  return ROLE_PERMISSIONS[roleName].permissions[permission] || false;
};

// Helper function to get all permissions for a role
const getRolePermissions = (roleName) => {
  return ROLE_PERMISSIONS[roleName] || null;
};

// Get all available roles
const getAvailableRoles = () => {
  return Object.keys(ROLE_PERMISSIONS).map((roleName) => ({
    name: roleName,
    description: ROLE_PERMISSIONS[roleName].description,
  }));
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  getAvailableRoles,
};
