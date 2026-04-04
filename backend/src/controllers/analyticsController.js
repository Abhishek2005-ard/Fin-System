const FinancialRecord = require("../models/FinancialRecord");
const User = require("../models/User");

// Get summary analytics
exports.getSummaryAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get total income and expenses
    const records = await FinancialRecord.find(query);

    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    const totalTransfers = records
      .filter((r) => r.type === "transfer")
      .reduce((sum, r) => sum + r.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    res.json({
      message: "Summary analytics retrieved successfully",
      data: {
        totalIncome,
        totalExpenses,
        totalTransfers,
        netBalance,
        transactionCount: records.length,
        period: {
          startDate: startDate || "All time",
          endDate: endDate || "All time",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category breakdown
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { type = "expense", startDate, endDate } = req.query;
    const query = { type };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const breakdown = await FinancialRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      message: "Category breakdown retrieved successfully",
      data: breakdown,
      type,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly trends
exports.getMonthlyTrends = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), type } = req.query;
    const query = {};

    if (type) query.type = type;

    // Set date range for the year
    query.date = {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${year + 1}-01-01`),
    };

    const trends = await FinancialRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    res.json({
      message: "Monthly trends retrieved successfully",
      data: trends,
      year,
      type: type || "all",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get weekly trends
exports.getWeeklyTrends = async (req, res) => {
  try {
    const {
      year = new Date().getFullYear(),
      startDate,
      endDate,
      type,
    } = req.query;
    const query = {};

    if (type) query.type = type;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    } else {
      query.date = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      };
    }

    const weeklyTrends = await FinancialRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    res.json({
      message: "Weekly trends retrieved successfully",
      data: weeklyTrends,
      year,
      type: type || "all",
      dateRange:
        startDate || endDate
          ? {
              startDate: startDate || "start of year",
              endDate: endDate || "end of year",
            }
          : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get transaction status distribution
exports.getTransactionStatusDistribution = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const distribution = await FinancialRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      message: "Transaction status distribution retrieved successfully",
      data: distribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get basic dashboard for viewers
exports.getBasicDashboard = async (req, res) => {
  try {
    const totalRecords = await FinancialRecord.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      message: "Basic dashboard data retrieved successfully",
      data: {
        totalRecords,
        totalUsers,
        systemStatus: "Operational",
      },
    });
  } catch (error) {
    console.error("Error retrieving basic dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve basic dashboard data",
      error: error.message,
    });
  }
};

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get records from the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = { date: { $gte: startDate } };

    const records = await FinancialRecord.find(query);

    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    const categoryBreakdown = await FinancialRecord.aggregate([
      { $match: { ...query, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    const recentRecords = await FinancialRecord.find(query)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .limit(10);

    res.json({
      success: true,
      message: "Dashboard overview retrieved successfully",
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          transactionCount: records.length,
        },
        topCategories: categoryBreakdown,
        recentRecords,
        period: {
          days,
          from: startDate.toISOString(),
          to: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving dashboard overview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard overview",
      error: error.message,
    });
  }
};
