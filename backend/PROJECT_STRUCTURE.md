# Project Structure & File Guide

## 📂 Complete Directory Structure

```
Fin-system/
│
├── src/                           # Source code directory
│   ├── config/
│   │   └── database.js            # MongoDB connection configuration
│   │
│   ├── controllers/               # Business logic layer
│   │   ├── authController.js      # Authentication (register, login)
│   │   ├── userController.js      # User CRUD operations
│   │   ├── roleController.js      # Role management
│   │   ├── recordController.js    # Basic financial records
│   │   ├── recordControllerEnhanced.js  # Advanced records features
│   │   └── analyticsController.js # Analytics and reporting
│   │
│   ├── middleware/                # Express middleware
│   │   ├── authenticate.js        # JWT verification
│   │   └── authorize.js           # Role-based access control
│   │
│   ├── models/                    # Database schemas
│   │   ├── User.js                # User schema with password hashing
│   │   ├── Role.js                # Role and permissions schema
│   │   └── FinancialRecord.js     # Financial transaction schema
│   │
│   ├── routes/                    # API route definitions
│   │   ├── authRoutes.js          # /api/auth endpoints
│   │   ├── userRoutes.js          # /api/users endpoints
│   │   ├── roleRoutes.js          # /api/roles endpoints
│   │   ├── recordRoutes.js        # /api/records endpoints (basic)
│   │   ├── recordRoutesEnhanced.js # /api/records endpoints (advanced)
│   │   └── analyticsRoutes.js     # /api/analytics endpoints
│   │
│   ├── utils/                     # Utility functions
│   │   └── recordUtils.js         # Helper functions for records
│   │
│   └── index.js                   # Application entry point
│
├── Documentation Files
│   ├── README.md                  # Project overview & setup guide
│   ├── API_DOCUMENTATION.md       # Complete API reference
│   ├── FINANCIAL_RECORDS_MANAGEMENT.md  # Records features guide
│   ├── FEATURES_OVERVIEW.md       # All features summary
│   ├── QUICK_REFERENCE.md         # Quick lookup & curl examples
│   ├── TESTING_GUIDE.md           # Step-by-step testing guide
│   ├── IMPLEMENTATION_SUMMARY.md  # Project completion status
│   └── PROJECT_STRUCTURE.md       # This file
│
├── Configuration Files
│   ├── package.json               # Dependencies & scripts
│   ├── .env.example               # Environment variables template
│   └── .gitignore                 # Git ignore rules
│
└── Database/                      # MongoDB (external)
    └── finance-dashboard          # Database name
        ├── users                  # Users collection
        ├── roles                  # Roles collection
        └── financial_records      # Financial records collection
```

---

## 📄 File Descriptions

### Configuration Layer (src/config/)

#### `database.js`

- **Purpose:** MongoDB connection setup
- **Functions:** `connectDB()`
- **Used By:** Main index.js
- **Environment Dependency:** `MONGODB_URI`

### Data Models (src/models/)

#### `User.js`

- **Fields:** name, email, password, role (ref), status, lastLogin
- **Methods:** `comparePassword()`, password hashing on save
- **Unique:** Email field
- **Status:** active/inactive

#### `Role.js`

- **Fields:** name, permissions, description
- **Values:** name can be Viewer, Analyst, or Admin
- **Permissions:** 8 granular permissions
- **Unique:** Role name

#### `FinancialRecord.js`

- **Fields:** transactionId, type, category, amount, currency, description, date, status, tags, attachment, createdBy, lastModifiedBy
- **Types:** income, expense, transfer
- **Status:** pending, completed, failed
- **Indexes:** (createdBy, date), (type, status) for performance

### Middleware (src/middleware/)

#### `authenticate.js`

- **Purpose:** JWT token verification
- **Extracts:** User ID from token
- **Sets:** `req.user` object
- **Error:** 401 if token missing/invalid

#### `authorize.js`

- **Purpose:** Role-based access control
- **Parameters:** Allowed roles
- **Checks:** User role against allowed roles
- **Sets:** `req.userRole` object
- **Error:** 403 if unauthorized

### Controllers (src/controllers/)

#### `authController.js`

- **Functions:**
  - `register()` - Create new user
  - `login()` - Authenticate and return JWT token
- **Returns:** User object + Token
- **Validation:** Email format, password length

#### `userController.js`

- **Functions:**
  - `getAllUsers()` - List all users (Admin)
  - `getUserById()` - Get specific user
  - `createUser()` - Create new user (Admin)
  - `updateUser()` - Update user (Admin)
  - `deleteUser()` - Delete user (Admin)
  - `changeUserStatus()` - Toggle active/inactive
- **Authorization:** Admin-only for most operations

#### `roleController.js`

- **Functions:**
  - `getAllRoles()` - List all roles
  - `getRoleById()` - Get specific role
  - `createRole()` - Create custom role (Admin)
  - `updateRole()` - Update role (Admin)
  - `initializeDefaultRoles()` - Create default roles
- **Default Roles:** Viewer, Analyst, Admin

#### `recordController.js`

- **Functions:**
  - `getAllRecords()` - Get all records with filtering
  - `getRecordById()` - Get specific record
  - `createRecord()` - Create new record
  - `updateRecord()` - Update record
  - `deleteRecord()` - Delete record (Admin)
  - `getRecordsByUser()` - Get user's records
- **Authorization:** Analyst+ for most operations

#### `recordControllerEnhanced.js` ⭐ NEW

- **Advanced Functions:**
  - `searchRecords()` - Multi-filter search with statistics
  - `createMultipleRecords()` - Bulk create with error handling
  - `deleteMultipleRecords()` - Bulk delete (Admin)
  - `exportRecordsAsCSV()` - CSV export
  - `exportRecordsAsJSON()` - JSON export
  - `getRecordStatistics()` - Detailed statistics
  - `findDuplicateRecords()` - Duplicate detection
  - `getCategories()` - List distinct categories
  - `getTags()` - List distinct tags
- **Features:** Advanced filtering, statistics, export

#### `analyticsController.js`

- **Functions:**
  - `getSummaryAnalytics()` - Income/expense/balance totals
  - `getCategoryBreakdown()` - Breakdown by category
  - `getMonthlyTrends()` - Month-by-month analysis
  - `getTransactionStatusDistribution()` - Status breakdown
  - `getDashboardOverview()` - Recent activity overview
- **Authorization:** Analyst+ access

### Routes (src/routes/)

#### `authRoutes.js` (2 endpoints)

```
POST /api/auth/register
POST /api/auth/login
```

#### `userRoutes.js` (6 endpoints)

```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/status
```

#### `roleRoutes.js` (5 endpoints)

```
POST /api/roles/initialize
GET  /api/roles
GET  /api/roles/:id
POST /api/roles
PUT  /api/roles/:id
```

#### `recordRoutes.js` (6 endpoints)

```
GET    /api/records
GET    /api/records/:id
POST   /api/records
PUT    /api/records/:id
DELETE /api/records/:id
GET    /api/records/user/:userId
```

#### `recordRoutesEnhanced.js` ⭐ NEW (14 endpoints)

```
GET    /api/records/search/advanced
POST   /api/records/bulk/create
POST   /api/records/bulk/delete
GET    /api/records/export/csv
GET    /api/records/export/json
GET    /api/records/stats/overview
GET    /api/records/stats/duplicates
GET    /api/records/data/categories
GET    /api/records/data/tags
[Plus all basic CRUD routes]
```

#### `analyticsRoutes.js` (5 endpoints)

```
GET /api/analytics/summary
GET /api/analytics/category-breakdown
GET /api/analytics/monthly-trends
GET /api/analytics/transaction-status
GET /api/analytics/dashboard-overview
```

### Utilities (src/utils/)

#### `recordUtils.js` ⭐ NEW

- **Functions:**
  - `buildAdvancedQuery()` - Construct MongoDB query from filters
  - `buildSort()` - Create sort options
  - `validateRecordData()` - Validate input data
  - `generateTransactionId()` - Create unique ID
  - `calculateStatistics()` - Compute aggregated stats
  - `checkDuplicate()` - Find duplicate transactions
  - `formatForCSVExport()` - Prepare CSV data
  - `formatForJSONExport()` - Prepare JSON data
- **Used By:** recordControllerEnhanced.js

### Application Entry Point

#### `index.js`

- **Purpose:** Express app initialization and server startup
- **Tasks:**
  - Load environment variables
  - Connect to MongoDB
  - Setup middleware (CORS, body parsing, logging)
  - Register all routes
  - Error handling
  - Start HTTP server
- **Port:** From environment variable (default: 5000)

---

## 📚 Documentation Files Guide

| File                            | Purpose                    | For Whom         |
| ------------------------------- | -------------------------- | ---------------- |
| README.md                       | Setup and overview         | New users        |
| API_DOCUMENTATION.md            | Complete API reference     | Developers       |
| FINANCIAL_RECORDS_MANAGEMENT.md | Records features guide     | Analysts         |
| FEATURES_OVERVIEW.md            | All features and use cases | Product managers |
| QUICK_REFERENCE.md              | Quick curl commands        | Developers       |
| TESTING_GUIDE.md                | Testing procedures         | QA/Testers       |
| IMPLEMENTATION_SUMMARY.md       | Status and completion      | Project managers |
| PROJECT_STRUCTURE.md            | This file                  | New developers   |

---

## 🔄 Request Flow Diagram

```
Client Request
     ↓
Express Router (routes/)
     ↓
Middleware
  ├─ authenticate.js (verify JWT)
  └─ authorize.js (check role)
     ↓
Controller (controllers/)
     ↓
Utility Functions (utils/)
     ↓
Model (models/)
     ↓
MongoDB Database
     ↓
Response → Client
```

---

## 🗄️ Database Schema Overview

### Users Collection

```
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ObjectId (ref: Role),
  status: String (enum: active, inactive),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Roles Collection

```
{
  _id: ObjectId,
  name: String (enum: Viewer, Analyst, Admin),
  permissions: {
    canViewDashboard: Boolean,
    canViewRecords: Boolean,
    canAccessInsights: Boolean,
    canCreateRecords: Boolean,
    canUpdateRecords: Boolean,
    canDeleteRecords: Boolean,
    canManageUsers: Boolean,
    canManageRoles: Boolean
  },
  description: String,
  createdAt: Date
}
```

### FinancialRecords Collection

```
{
  _id: ObjectId,
  transactionId: String (unique),
  type: String (enum: income, expense, transfer),
  category: String,
  amount: Number,
  currency: String,
  description: String,
  date: Date,
  status: String (enum: pending, completed, failed),
  createdBy: ObjectId (ref: User),
  lastModifiedBy: ObjectId (ref: User),
  tags: [String],
  attachment: String,
  createdAt: Date,
  updatedAt: Date,
  indexes: [(createdBy, date), (type, status)]
}
```

---

## 🔐 Authentication & Authorization Flow

```
1. User Registration
   register() → Validate → Hash password → Create user → Return user data

2. User Login
   login() → Find user → Compare password → Create JWT → Return token

3. Protected Request
   Client sends request with token
   ↓
   authenticate() → Verify JWT → Extract user ID → Continue
   ↓
   authorize() → Fetch user role → Check permissions → Continue
   ↓
   Controller executes

4. Role-Based Access
   Viewer: Dashboard only
   Analyst: Records + Analytics
   Admin: Everything
```

---

## 📊 Data Flow Examples

### Creating a Record

```
POST /api/records
  ├─ authenticate middleware ← JWT verification
  ├─ authorize middleware ← Check Analyst+
  ├─ recordControllerEnhanced.createRecord()
  │  ├─ validateRecordData() ← Input validation
  │  ├─ checkDuplicate() ← Check unique ID
  │  └─ Save to MongoDB
  └─ Return created record
```

### Searching Records

```
GET /api/records/search/advanced?filters
  ├─ authenticate middleware
  ├─ authorize middleware
  ├─ recordControllerEnhanced.searchRecords()
  │  ├─ buildAdvancedQuery() ← Build MongoDB query
  │  ├─ buildSort() ← Add sorting
  │  ├─ Execute query
  │  ├─ calculateStatistics() ← Compute stats
  │  └─ Return paginated results
```

### Exporting Records

```
GET /api/records/export/csv
  ├─ authenticate middleware
  ├─ authorize middleware
  ├─ recordControllerEnhanced.exportRecordsAsCSV()
  │  ├─ buildAdvancedQuery() ← Apply filters
  │  ├─ Fetch records
  │  ├─ formatForCSVExport() ← Convert format
  │  ├─ Generate CSV
  │  └─ Set headers for download
  └─ Return CSV file
```

---

## 🚀 Starting the Application

### Step 1: Install Dependencies

```bash
cd Fin-system
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### Step 3: Start MongoDB

```bash
mongod
```

### Step 4: Run Server

```bash
npm run dev  # Development
npm start    # Production
```

### Step 5: Initialize Roles

```bash
curl -X POST http://localhost:5000/api/roles/initialize
```

---

## 📝 File Modification Guide

### To Add a New Feature:

1. **Create Model** (if needed) - `src/models/Feature.js`
2. **Create Controller** - `src/controllers/featureController.js`
3. **Create Routes** - `src/routes/featureRoutes.js`
4. **Add Utilities** (if needed) - `src/utils/featureUtils.js`
5. **Middleware** (if needed) - `src/middleware/featureMiddleware.js`
6. **Register Routes** - Update `src/index.js`
7. **Update Documentation**
8. **Add Tests** - Reference `TESTING_GUIDE.md`

### To Add a New Endpoint:

1. **Add Controller Method** - Add function to controller
2. **Add Route** - Add route to routes file with middleware
3. **Add Validation** - Use express-validator
4. **Add Tests** - Document test case
5. **Update Documentation**

---

## 🎯 Quick File Reference

| Task                | File to Check                               |
| ------------------- | ------------------------------------------- |
| Add user field      | src/models/User.js                          |
| Add permission      | src/models/Role.js                          |
| Add record field    | src/models/FinancialRecord.js               |
| Add auth endpoint   | src/controllers/authController.js           |
| Add user endpoint   | src/controllers/userController.js           |
| Add role endpoint   | src/controllers/roleController.js           |
| Add record endpoint | src/controllers/recordControllerEnhanced.js |
| Add analytics       | src/controllers/analyticsController.js      |
| Add helper function | src/utils/recordUtils.js                    |
| Change auth flow    | src/middleware/authenticate.js              |
| Change permissions  | src/middleware/authorize.js                 |
| Change routes       | src/routes/\*.js                            |
| Configure server    | src/index.js                                |
| Configure DB        | src/config/database.js                      |
| Manage dependencies | package.json                                |

---

## ✅ File Checklist

### Source Code Files

- [x] src/config/database.js
- [x] src/models/User.js
- [x] src/models/Role.js
- [x] src/models/FinancialRecord.js
- [x] src/controllers/authController.js
- [x] src/controllers/userController.js
- [x] src/controllers/roleController.js
- [x] src/controllers/recordController.js
- [x] src/controllers/recordControllerEnhanced.js
- [x] src/controllers/analyticsController.js
- [x] src/middleware/authenticate.js
- [x] src/middleware/authorize.js
- [x] src/routes/authRoutes.js
- [x] src/routes/userRoutes.js
- [x] src/routes/roleRoutes.js
- [x] src/routes/recordRoutes.js
- [x] src/routes/recordRoutesEnhanced.js
- [x] src/routes/analyticsRoutes.js
- [x] src/utils/recordUtils.js
- [x] src/index.js

### Configuration Files

- [x] package.json
- [x] .env.example
- [x] .gitignore

### Documentation Files

- [x] README.md
- [x] API_DOCUMENTATION.md
- [x] FINANCIAL_RECORDS_MANAGEMENT.md
- [x] FEATURES_OVERVIEW.md
- [x] QUICK_REFERENCE.md
- [x] TESTING_GUIDE.md
- [x] IMPLEMENTATION_SUMMARY.md
- [x] PROJECT_STRUCTURE.md

---

## 🎉 You're All Set!

The project structure is complete and well-organized. Each file has a specific purpose, and the architecture supports easy expansion and maintenance.

Start with:

1. **README.md** for setup
2. **QUICK_REFERENCE.md** for API examples
3. **TESTING_GUIDE.md** for testing
4. **API_DOCUMENTATION.md** for complete reference

Happy coding! 🚀
