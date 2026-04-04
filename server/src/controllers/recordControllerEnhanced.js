const FinancialRecord = require("../models/FinancialRecord");
const {
  buildAdvancedQuery,
  buildSort,
  validateRecordData,
  generateTransactionId,
  calculateStatistics,
  checkDuplicate,
  formatForCSVExport,
  formatForJSONExport,
} = require("../utils/recordUtils");
const json2csv = require("json2csv").Parser;

// === ENHANCED FILTERING & SEARCH ===

// Advanced search and filter
exports.searchRecords = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      tags,
      search,
      sortBy = "date-desc",
    } = req.query;

    // Build query with filters
    const query = buildAdvancedQuery({
      type,
      status,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      tags,
      search,
    });

    // Build sort options
    const sort = buildSort(sortBy);

    // Execute query
    const records = await FinancialRecord.find(query)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await FinancialRecord.countDocuments(query);

    // Calculate statistics for filtered results
    const allRecords = await FinancialRecord.find(query);
    const statistics = calculateStatistics(allRecords);

    res.json({
      message: "Records search completed successfully",
      data: records,
      statistics,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      filters: {
        type: type || "all",
        status: status || "all",
        category: category || "all",
        dateRange: {
          from: startDate || "all",
          to: endDate || "all",
        },
        amountRange: {
          min: minAmount || "all",
          max: maxAmount || "all",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all financial records (original with basic filters)
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
      message: "Financial records retrieved successfully",
      data: records,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get record by ID
exports.getRecordById = async (req, res) => {
  try {
    const record = await FinancialRecord.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Financial record retrieved successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new financial record with validation
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

    // Validate input
    const validation = validateRecordData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Validation error",
        errors: validation.errors,
      });
    }

    // Check for duplicate transaction ID
    const isDuplicate = await checkDuplicate(FinancialRecord, transactionId);
    if (isDuplicate) {
      return res.status(400).json({ message: "Transaction ID already exists" });
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
      message: "Financial record created successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create multiple records (Bulk create)
exports.createMultipleRecords = async (req, res) => {
  try {
    const records = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res
        .status(400)
        .json({ message: "Records array is required and must not be empty" });
    }

    const createdRecords = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      try {
        // Validate each record
        const validation = validateRecordData(records[i]);
        if (!validation.isValid) {
          errors.push({
            index: i,
            data: records[i],
            errors: validation.errors,
          });
          continue;
        }

        // Check for duplicate
        const isDuplicate = await checkDuplicate(
          FinancialRecord,
          records[i].transactionId,
        );
        if (isDuplicate) {
          errors.push({
            index: i,
            data: records[i],
            error: "Transaction ID already exists",
          });
          continue;
        }

        const record = new FinancialRecord({
          ...records[i],
          currency: records[i].currency || "USD",
          date: records[i].date || new Date(),
          status: records[i].status || "completed",
          createdBy: req.user.id,
          tags: records[i].tags || [],
        });

        const saved = await record.save();
        createdRecords.push(saved);
      } catch (error) {
        errors.push({
          index: i,
          data: records[i],
          error: error.message,
        });
      }
    }

    res.status(201).json({
      message: `Created ${createdRecords.length} out of ${records.length} records`,
      data: {
        successful: createdRecords.length,
        failed: errors.length,
        records: createdRecords,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update financial record
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
      return res.status(404).json({ message: "Record not found" });
    }

    // Update fields
    if (type) record.type = type;
    if (category) record.category = category;
    if (amount) record.amount = amount;
    if (currency) record.currency = currency;
    if (description) record.description = description;
    if (date) record.date = date;
    if (status) record.status = status;
    if (tags) record.tags = tags;
    if (attachment) record.attachment = attachment;

    record.lastModifiedBy = req.user.id;
    record.updatedAt = new Date();

    await record.save();
    await record
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email");

    res.json({
      message: "Financial record updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete financial record
exports.deleteRecord = async (req, res) => {
  try {
    const record = await FinancialRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({
      message: "Financial record deleted successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete multiple records (Bulk delete)
exports.deleteMultipleRecords = async (req, res) => {
  try {
    const { recordIds } = req.body;

    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({ message: "Record IDs array is required" });
    }

    const result = await FinancialRecord.deleteMany({
      _id: { $in: recordIds },
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} records`,
      data: {
        deletedCount: result.deletedCount,
        requestedCount: recordIds.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      message: "User financial records retrieved successfully",
      data: records,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === EXPORT FEATURES ===

// Export records as CSV
exports.exportRecordsAsCSV = async (req, res) => {
  try {
    const { type, status, category, startDate, endDate, minAmount, maxAmount } =
      req.query;

    const query = buildAdvancedQuery({
      type,
      status,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    });

    const records = await FinancialRecord.find(query)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .sort({ date: -1 });

    if (records.length === 0) {
      return res.status(404).json({ message: "No records found to export" });
    }

    const csvData = formatForCSVExport(records);
    const parser = new json2csv({ header: true });
    const csv = parser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.header(
      "Content-Disposition",
      'attachment; filename="financial-records.csv"',
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export records as JSON
exports.exportRecordsAsJSON = async (req, res) => {
  try {
    const { type, status, category, startDate, endDate, minAmount, maxAmount } =
      req.query;

    const query = buildAdvancedQuery({
      type,
      status,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    });

    const records = await FinancialRecord.find(query)
      .populate("createdBy", "name email")
      .populate("lastModifiedBy", "name email")
      .sort({ date: -1 });

    if (records.length === 0) {
      return res.status(404).json({ message: "No records found to export" });
    }

    const jsonData = formatForJSONExport(records);

    res.header("Content-Type", "application/json");
    res.header(
      "Content-Disposition",
      'attachment; filename="financial-records.json"',
    );
    res.json({
      message: "Financial records exported successfully",
      exportDate: new Date(),
      totalRecords: records.length,
      data: jsonData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === STATISTICS & ANALYTICS ===

// Get record statistics
exports.getRecordStatistics = async (req, res) => {
  try {
    const { type, status, category, startDate, endDate, minAmount, maxAmount } =
      req.query;

    const query = buildAdvancedQuery({
      type,
      status,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    });

    const records = await FinancialRecord.find(query);
    const statistics = calculateStatistics(records);

    res.json({
      message: "Record statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get duplicate records
exports.findDuplicateRecords = async (req, res) => {
  try {
    const duplicates = await FinancialRecord.aggregate([
      {
        $group: {
          _id: "$transactionId",
          count: { $sum: 1 },
          records: { $push: "$$ROOT" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      message: "Duplicate records found",
      data: {
        duplicateGroups: duplicates.length,
        details: duplicates,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await FinancialRecord.distinct("category");

    res.json({
      message: "Categories retrieved successfully",
      data: {
        totalCategories: categories.length,
        categories: categories.sort(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available tags
exports.getTags = async (req, res) => {
  try {
    const records = await FinancialRecord.find({}, { tags: 1 });
    const allTags = new Set();

    records.forEach((record) => {
      if (record.tags && Array.isArray(record.tags)) {
        record.tags.forEach((tag) => allTags.add(tag));
      }
    });

    res.json({
      message: "Tags retrieved successfully",
      data: {
        totalTags: allTags.size,
        tags: Array.from(allTags).sort(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
