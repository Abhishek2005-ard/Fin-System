const mongoose = require("mongoose");
const User = require("../models/User");
const FinancialRecord = require("../models/FinancialRecord");
const Role = require("../models/Role");

/**
 * Database utility functions for maintenance and monitoring
 */
class DatabaseUtils {
  /**
   * Get database connection status
   */
  static getConnectionStatus() {
    const state = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return {
      status: states[state] || "unknown",
      state: state,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    };
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats() {
    try {
      const stats = await mongoose.connection.db.stats();

      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const collectionStats = {};

      for (const collection of collections) {
        const collStats = await mongoose.connection.db
          .collection(collection.name)
          .stats();
        collectionStats[collection.name] = {
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
        };
      }

      return {
        database: stats.db,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        collectionDetails: collectionStats,
      };
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  }

  /**
   * Get collection counts
   */
  static async getCollectionCounts() {
    try {
      const [userCount, recordCount, roleCount] = await Promise.all([
        User.countDocuments(),
        FinancialRecord.countDocuments(),
        Role.countDocuments(),
      ]);

      return {
        users: userCount,
        financialRecords: recordCount,
        roles: roleCount,
        total: userCount + recordCount + roleCount,
      };
    } catch (error) {
      throw new Error(`Failed to get collection counts: ${error.message}`);
    }
  }

  /**
   * Clean up old or invalid data (optional maintenance)
   */
  static async cleanupInvalidData() {
    try {
      const results = {
        orphanedRecords: 0,
        invalidRecords: 0,
      };

      // Find records with invalid user references
      const invalidRecords = await FinancialRecord.find({
        createdBy: { $exists: true },
      }).populate("createdBy");

      for (const record of invalidRecords) {
        if (!record.createdBy) {
          await FinancialRecord.findByIdAndDelete(record._id);
          results.orphanedRecords++;
        }
      }

      // Find records with future dates (potential data entry errors)
      const futureRecords = await FinancialRecord.find({
        date: { $gt: new Date() },
      });

      for (const record of futureRecords) {
        // Mark as invalid or correct the date
        record.status = "failed";
        await record.save();
        results.invalidRecords++;
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to cleanup data: ${error.message}`);
    }
  }

  /**
   * Backup database structure (schema information)
   */
  static async getSchemaInfo() {
    try {
      const schemas = {
        User: User.schema.obj,
        FinancialRecord: FinancialRecord.schema.obj,
        Role: Role.schema.obj,
      };

      const indexes = {
        User: User.schema.indexes(),
        FinancialRecord: FinancialRecord.schema.indexes(),
        Role: Role.schema.indexes(),
      };

      return {
        schemas,
        indexes,
        version: mongoose.version,
      };
    } catch (error) {
      throw new Error(`Failed to get schema info: ${error.message}`);
    }
  }

  /**
   * Health check for database
   */
  static async healthCheck() {
    try {
      const startTime = Date.now();

      // Test basic connectivity
      await mongoose.connection.db.admin().ping();

      // Test a simple query
      await User.findOne().limit(1);

      const responseTime = Date.now() - startTime;

      return {
        status: "healthy",
        responseTime: `${responseTime}ms`,
        connection: this.getConnectionStatus(),
        collections: await this.getCollectionCounts(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        connection: this.getConnectionStatus(),
      };
    }
  }
}

module.exports = DatabaseUtils;
