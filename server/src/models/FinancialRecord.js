const mongoose = require("mongoose");

const financialRecordSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: [true, "Transaction ID is required"],
    unique: true,
    trim: true,
    minlength: [1, "Transaction ID cannot be empty"],
    maxlength: [50, "Transaction ID cannot exceed 50 characters"],
  },

  type: {
    type: String,
    enum: {
      values: ["income", "expense", "transfer"],
      message: "Type must be either income, expense, or transfer",
    },
    required: [true, "Transaction type is required"],
  },

  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    minlength: [1, "Category cannot be empty"],
    maxlength: [100, "Category cannot exceed 100 characters"],
  },

  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0.01, "Amount must be greater than 0"],
    validate: {
      validator: function (value) {
        return !isNaN(value) && isFinite(value);
      },
      message: "Amount must be a valid number",
    },
  },

  currency: {
    type: String,
    default: "USD",
    uppercase: true,
    minlength: [3, "Currency code must be 3 characters"],
    maxlength: [3, "Currency code must be 3 characters"],
  },

  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"],
    trim: true,
  },

  date: {
    type: Date,
    required: [true, "Date is required"],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: "Date cannot be in the future",
    },
  },

  status: {
    type: String,
    enum: {
      values: ["pending", "completed", "failed"],
      message: "Status must be either pending, completed, or failed",
    },
    default: "completed",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Creator is required"],
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  attachment: {
    type: String,
    validate: {
      validator: function (value) {
        if (!value) return true; // Allow empty
        return /^https?:\/\/.+/.test(value);
      },
      message: "Attachment must be a valid URL",
    },
  },

  tags: [
    {
      type: String,
      trim: true,
      maxlength: [50, "Tag cannot exceed 50 characters"],
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
financialRecordSchema.index({ transactionId: 1 }, { unique: true });
financialRecordSchema.index({ createdBy: 1, date: -1 });
financialRecordSchema.index({ type: 1, status: 1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
financialRecordSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted amount
financialRecordSchema.virtual("formattedAmount").get(function () {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Ensure virtual fields are serialized
financialRecordSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("FinancialRecord", financialRecordSchema);
