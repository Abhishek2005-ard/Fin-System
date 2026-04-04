const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  // Role name: "Viewer", "Analyst", or "Admin"
  name: {
    type: String,
    enum: {
      values: ["Viewer", "Analyst", "Admin"],
      message: "Role name must be either Viewer, Analyst, or Admin",
    },
    required: [true, "Role name is required"],
    unique: true,
    trim: true,
  },

  // Description of what this role can do
  description: {
    type: String,
    required: [true, "Role description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
    maxlength: [200, "Description cannot exceed 200 characters"],
  },

  // When this role was created
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // When this role was last updated
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for performance
roleSchema.index({ name: 1 }, { unique: true });

// Update the updatedAt field before saving
roleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Role", roleSchema);
