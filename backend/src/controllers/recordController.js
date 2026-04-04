const FinancialRecord = require("../models/FinancialRecord");

// Get all financial records
exports.getAllRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    const records = await FinancialRecord.find(query)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await FinancialRecord.countDocuments(query);

    res.json({
      success: true,
      message: "Financial records retrieved successfully",
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error retrieving records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve financial records",
      error: error.message,
    });
  }
};

// Get record by ID
exports.getRecordById = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Financial record not found",
        error: "No record exists with the provided ID",
      });
    }

    res.json({
      success: true,
      message: "Financial record retrieved successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error retrieving record:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid record ID format",
        error: "The provided ID is not a valid MongoDB ObjectId",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to retrieve financial record",
      error: error.message,
    });
  }
};

// Create a new financial record (Analyst and Admin)
exports.createRecord = async (req, res) => {
  try {
    const {
      transactionId,
      type,
      category,
      amount,
      currency,
      description,
      date,
      status,
      tags,
      attachment,
    } = req.body;

    // Check if transaction ID already exists
    const existingRecord = await FinancialRecord.findOne({ transactionId });
    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: "Transaction ID already exists",
        error: "A record with this transaction ID is already in the system",
      });
    }

    const record = new FinancialRecord({
      transactionId,
      type,
      category,
      amount,
      currency: currency || "USD",
      description,
      date: date || new Date(),
      status: status || "completed",
      createdBy: req.user.id,
      tags: tags || [],
      attachment,
    });

    await record.save();
    await record.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Financial record created successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error creating record:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid record data",
        error: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate transaction ID",
        error: "A record with this transaction ID already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create financial record",
      error: error.message,
    });
  }
};

// Update financial record (Analyst and Admin)
exports.updateRecord = async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      currency,
      description,
      date,
      status,
      tags,
      attachment,
    } = req.body;
    const recordId = req.params.id;

    const record = await FinancialRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Financial record not found",
        error: "No record exists with the provided ID",
      });
    }

    // Update fields
    if (type !== undefined) record.type = type;
    if (category !== undefined) record.category = category;
    if (amount !== undefined) record.amount = amount;
    if (currency !== undefined) record.currency = currency;
    if (description !== undefined) record.description = description;
    if (date !== undefined) record.date = date;
    if (status !== undefined) record.status = status;
    if (tags !== undefined) record.tags = tags;
    if (attachment !== undefined) record.attachment = attachment;

    record.lastModifiedBy = req.user.id;
    record.updatedAt = new Date();

    await record.save();
    await record
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    res.json({
      success: true,
      message: "Financial record updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error updating record:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid update data",
        error: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid record ID format",
        error: "The provided ID is not a valid MongoDB ObjectId",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update financial record",
      error: error.message,
    });
  }
};

// Delete financial record (Admin only)
exports.deleteRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Financial record not found",
        error: "No record exists with the provided ID",
      });
    }

    res.json({
      success: true,
      message: "Financial record deleted successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid record ID format",
        error: "The provided ID is not a valid MongoDB ObjectId",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete financial record",
      error: error.message,
    });
  }
};

// Get records by user
exports.getRecordsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.userId;

    const records = await FinancialRecord.find({ createdBy: userId })
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await FinancialRecord.countDocuments({ createdBy: userId });

    res.json({
      success: true,
      message: "User financial records retrieved successfully",
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error retrieving user records:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        error: "The provided user ID is not a valid MongoDB ObjectId",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user financial records",
      error: error.message,
    });
  }
};
