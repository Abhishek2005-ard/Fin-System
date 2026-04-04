const User = require("../models/User");
const { ROLES } = require("../utils/rolePermissions");

/**
 * GET /users
 * Retrieve all users (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

/**
 * GET /users/:id
 * Retrieve a specific user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error: error.message,
    });
  }
};

/**
 * POST /users
 * Create a new user (Admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${Object.values(ROLES).join(
          ", ",
        )}`,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role: role || ROLES.VIEWER,
      status: status || "active",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

/**
 * PUT /users/:id
 * Update user details (Admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "This email is already in use",
        });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (status && ["active", "inactive"].includes(status)) {
      user.status = status;
    }
    if (role && Object.values(ROLES).includes(role)) {
      user.role = role;
    }

    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

/**
 * DELETE /users/:id
 * Delete a user (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

/**
 * PATCH /users/:id/status
 * Change user's active/inactive status (Admin only)
 */
exports.changeUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    // Validate status
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "active" or "inactive"',
      });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { status, updatedAt: new Date() },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: {
        id: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message,
    });
  }
};
