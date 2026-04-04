require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");

console.log("ENV:", process.env.NODE_ENV);
// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const recordRoutesEnhanced = require("./routes/recordRoutesEnhanced");
const analyticsRoutes = require("./routes/analyticsRoutes");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for Render and browser health checks
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Finance Dashboard Backend API",
    root: "/",
    endpoints: [
      { path: "/api/health", description: "Health check" },
      { path: "/api/auth", description: "Authentication routes" },
      { path: "/api/users", description: "User management" },
      { path: "/api/roles", description: "Role management" },
      { path: "/api/records", description: "Financial record management" },
      { path: "/api/analytics", description: "Analytics data" },
    ],
  });
});

// Base API route for convenience
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Finance Dashboard Backend API root",
    root: "/api",
    availableRoutes: [
      { path: "/api/health", description: "Health check" },
      { path: "/api/auth", description: "Authentication routes" },
      { path: "/api/users", description: "User management" },
      { path: "/api/roles", description: "Role management" },
      { path: "/api/records", description: "Financial record management" },
      { path: "/api/analytics", description: "Analytics data" },
    ],
  });
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const DatabaseUtils = require("./utils/databaseUtils");
    const dbHealth = await DatabaseUtils.healthCheck();

    res.json({
      message: "Finance Dashboard Backend is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV,
      database: dbHealth,
    });
  } catch (error) {
    res.status(500).json({
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Database status endpoint (Admin only)
app.get(
  "/api/admin/database-status",
  require("./middleware/authenticate"),
  require("./middleware/checkPermission")("manageUsers"),
  async (req, res) => {
    try {
      const DatabaseUtils = require("./utils/databaseUtils");
      const [stats, counts, schema] = await Promise.all([
        DatabaseUtils.getDatabaseStats(),
        DatabaseUtils.getCollectionCounts(),
        DatabaseUtils.getSchemaInfo(),
      ]);

      res.json({
        message: "Database status retrieved successfully",
        timestamp: new Date().toISOString(),
        stats,
        counts,
        schema,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve database status",
        error: error.message,
      });
    }
  },
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/records", recordRoutesEnhanced); // Use enhanced routes
app.use("/api/analytics", analyticsRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An error occurred",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
