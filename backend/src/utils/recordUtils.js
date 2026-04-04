// Utility functions for financial records management

// Build advanced query filter
const buildAdvancedQuery = (filters) => {
  const query = {};

  // Filter by type
  if (filters.type) {
    query.type = filters.type;
  }

  // Filter by status
  if (filters.status) {
    query.status = filters.status;
  }

  // Filter by category (case-insensitive)
  if (filters.category) {
    query.category = new RegExp(filters.category, "i");
  }

  // Filter by date range
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.date.$lte = endDate;
    }
  }

  // Filter by amount range
  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) {
      query.amount.$gte = parseFloat(filters.minAmount);
    }
    if (filters.maxAmount) {
      query.amount.$lte = parseFloat(filters.maxAmount);
    }
  }

  // Search in tags
  if (filters.tags) {
    const tagsArray = Array.isArray(filters.tags)
      ? filters.tags
      : [filters.tags];
    query.tags = { $in: tagsArray };
  }

  // Search by user
  if (filters.createdBy) {
    query.createdBy = filters.createdBy;
  }

  // Search in description (full-text search)
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return query;
};

// Sort builder
const buildSort = (sortBy) => {
  const sortOptions = {
    "date-desc": { date: -1 },
    "date-asc": { date: 1 },
    "amount-desc": { amount: -1 },
    "amount-asc": { amount: 1 },
    category: { category: 1 },
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };

  return sortOptions[sortBy] || { date: -1 };
};

// Validate financial record data
const validateRecordData = (data) => {
  const errors = [];

  if (!data.transactionId || data.transactionId.trim() === "") {
    errors.push("Transaction ID is required");
  }

  if (!["income", "expense", "transfer"].includes(data.type)) {
    errors.push("Invalid transaction type");
  }

  if (!data.category || data.category.trim() === "") {
    errors.push("Category is required");
  }

  if (data.amount && (isNaN(data.amount) || data.amount < 0)) {
    errors.push("Amount must be a positive number");
  }

  if (data.date && Number.isNaN(new Date(data.date).getTime())) {
    errors.push("Date must be a valid ISO date string");
  }

  if (
    data.status &&
    !["pending", "completed", "failed"].includes(data.status)
  ) {
    errors.push("Invalid status");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Generate unique transaction ID if not provided
const generateTransactionId = async (FinancialRecord) => {
  const count = await FinancialRecord.countDocuments();
  return `TXN-${Date.now()}-${count + 1}`;
};

// Calculate record statistics
const calculateStatistics = (records) => {
  const stats = {
    totalRecords: records.length,
    totalIncome: 0,
    totalExpense: 0,
    totalTransfer: 0,
    totalAmount: 0,
    averageTransaction: 0,
    byType: {
      income: 0,
      expense: 0,
      transfer: 0,
    },
    byStatus: {
      pending: 0,
      completed: 0,
      failed: 0,
    },
    byCategory: {},
  };

  records.forEach((record) => {
    stats.totalAmount += record.amount;

    if (record.type === "income") {
      stats.totalIncome += record.amount;
      stats.byType.income += 1;
    } else if (record.type === "expense") {
      stats.totalExpense += record.amount;
      stats.byType.expense += 1;
    } else if (record.type === "transfer") {
      stats.totalTransfer += record.amount;
      stats.byType.transfer += 1;
    }

    // Count by status
    stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;

    // Count by category
    const category = record.category;
    stats.byCategory[category] =
      (stats.byCategory[category] || 0) + record.amount;
  });

  stats.averageTransaction =
    records.length > 0 ? stats.totalAmount / records.length : 0;

  return stats;
};

// Check for duplicate transactions
const checkDuplicate = async (
  FinancialRecord,
  transactionId,
  excludeId = null,
) => {
  const query = { transactionId };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingRecord = await FinancialRecord.findOne(query);
  return existingRecord ? true : false;
};

// Format records for CSV export
const formatForCSVExport = (records) => {
  return records.map((record) => ({
    "Transaction ID": record.transactionId,
    Type: record.type,
    Category: record.category,
    Amount: record.amount,
    Currency: record.currency,
    Description: record.description || "",
    Date: new Date(record.date).toLocaleDateString(),
    Status: record.status,
    Tags: record.tags ? record.tags.join("; ") : "",
    "Created At": new Date(record.createdAt).toLocaleString(),
    "Updated At": new Date(record.updatedAt).toLocaleString(),
  }));
};

// Format records for JSON export
const formatForJSONExport = (records) => {
  return records.map((record) => ({
    transactionId: record.transactionId,
    type: record.type,
    category: record.category,
    amount: record.amount,
    currency: record.currency,
    description: record.description,
    date: record.date,
    status: record.status,
    tags: record.tags,
    createdBy: {
      id: record.createdBy._id,
      name: record.createdBy.name,
      email: record.createdBy.email,
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }));
};

module.exports = {
  buildAdvancedQuery,
  buildSort,
  validateRecordData,
  generateTransactionId,
  calculateStatistics,
  checkDuplicate,
  formatForCSVExport,
  formatForJSONExport,
};
