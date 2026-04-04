# Quick Reference Guide - Finance Dashboard API

A fast lookup guide for the most common API operations.

## 🚀 Setup (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Configure .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_secret_key
NODE_ENV=development

# 3. Start server
npm run dev

# 4. Initialize roles
curl -X POST http://localhost:5000/api/roles/initialize
```

---

## 🔑 Authentication

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "roleId": "ROLE_ID_HERE"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token from response!**

### Use Token in Requests

```bash
-H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 👤 User Management

### List All Users (Admin)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>"
```

### Create User (Admin)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "roleId": "ROLE_ID",
    "status": "active"
  }'
```

### Update User (Admin)

```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name"}'
```

### Change User Status (Admin)

```bash
curl -X PATCH http://localhost:5000/api/users/USER_ID/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

### Delete User (Admin)

```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer <token>"
```

---

## 💰 Financial Records - CRUD

### Create Record

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN001",
    "type": "income",
    "category": "Salary",
    "amount": 5000,
    "currency": "USD",
    "description": "Monthly salary",
    "date": "2024-01-15",
    "status": "completed",
    "tags": ["salary", "monthly"]
  }'
```

### Get All Records

```bash
curl -X GET "http://localhost:5000/api/records?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Get Record by ID

```bash
curl -X GET http://localhost:5000/api/records/RECORD_ID \
  -H "Authorization: Bearer <token>"
```

### Update Record

```bash
curl -X PUT http://localhost:5000/api/records/RECORD_ID \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5500,
    "status": "completed"
  }'
```

### Delete Record (Admin)

```bash
curl -X DELETE http://localhost:5000/api/records/RECORD_ID \
  -H "Authorization: Bearer <token>"
```

---

## 🔍 Advanced Search & Filtering

### Search with Filters

```bash
# By type and status
curl -X GET "http://localhost:5000/api/records/search/advanced?type=expense&status=completed" \
  -H "Authorization: Bearer <token>"

# By date range
curl -X GET "http://localhost:5000/api/records/search/advanced?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"

# By amount range
curl -X GET "http://localhost:5000/api/records/search/advanced?minAmount=100&maxAmount=1000" \
  -H "Authorization: Bearer <token>"

# By category
curl -X GET "http://localhost:5000/api/records/search/advanced?category=Groceries" \
  -H "Authorization: Bearer <token>"

# By tags
curl -X GET "http://localhost:5000/api/records/search/advanced?tags=salary" \
  -H "Authorization: Bearer <token>"

# Full-text search
curl -X GET "http://localhost:5000/api/records/search/advanced?search=salary+payment" \
  -H "Authorization: Bearer <token>"

# Sort options
curl -X GET "http://localhost:5000/api/records/search/advanced?sortBy=amount-desc" \
  -H "Authorization: Bearer <token>"

# Sort options: date-desc, date-asc, amount-desc, amount-asc, category, recent, oldest
```

---

## 📦 Bulk Operations

### Create Multiple Records

```bash
curl -X POST http://localhost:5000/api/records/bulk/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "transactionId": "BULK001",
      "type": "income",
      "category": "Salary",
      "amount": 5000,
      "description": "Salary"
    },
    {
      "transactionId": "BULK002",
      "type": "expense",
      "category": "Groceries",
      "amount": 150,
      "description": "Groceries"
    }
  ]'
```

### Delete Multiple Records (Admin)

```bash
curl -X POST http://localhost:5000/api/records/bulk/delete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recordIds": [
      "RECORD_ID_1",
      "RECORD_ID_2",
      "RECORD_ID_3"
    ]
  }'
```

---

## 📊 Export & Import

### Export as CSV

```bash
# Export all
curl -X GET http://localhost:5000/api/records/export/csv \
  -H "Authorization: Bearer <token>" \
  --output records.csv

# Export with filters
curl -X GET "http://localhost:5000/api/records/export/csv?type=expense&startDate=2024-01-01" \
  -H "Authorization: Bearer <token>" \
  --output expenses-january.csv
```

### Export as JSON

```bash
# Export all
curl -X GET http://localhost:5000/api/records/export/json \
  -H "Authorization: Bearer <token>" \
  --output records.json

# Export with filters
curl -X GET "http://localhost:5000/api/records/export/json?category=Salary" \
  -H "Authorization: Bearer <token>" \
  --output salary-records.json
```

---

## 📈 Analytics & Statistics

### Summary Statistics

```bash
curl -X GET http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer <token>"

# With date range
curl -X GET "http://localhost:5000/api/analytics/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Category Breakdown

```bash
curl -X GET "http://localhost:5000/api/analytics/category-breakdown?type=expense" \
  -H "Authorization: Bearer <token>"
```

### Monthly Trends

```bash
curl -X GET "http://localhost:5000/api/analytics/monthly-trends?year=2024&type=income" \
  -H "Authorization: Bearer <token>"
```

### Transaction Status Distribution

```bash
curl -X GET http://localhost:5000/api/analytics/transaction-status \
  -H "Authorization: Bearer <token>"
```

### Dashboard Overview

```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard-overview?days=30" \
  -H "Authorization: Bearer <token>"
```

### Record Statistics

```bash
curl -X GET http://localhost:5000/api/records/stats/overview \
  -H "Authorization: Bearer <token>"

# With filters
curl -X GET "http://localhost:5000/api/records/stats/overview?type=expense&startDate=2024-01-01" \
  -H "Authorization: Bearer <token>"
```

### Find Duplicates (Admin)

```bash
curl -X GET http://localhost:5000/api/records/stats/duplicates \
  -H "Authorization: Bearer <token>"
```

---

## 🏷️ Data Lookup

### Get Categories

```bash
curl -X GET http://localhost:5000/api/records/data/categories \
  -H "Authorization: Bearer <token>"
```

### Get Tags

```bash
curl -X GET http://localhost:5000/api/records/data/tags \
  -H "Authorization: Bearer <token>"
```

---

## 👥 Roles Management

### List Roles

```bash
curl -X GET http://localhost:5000/api/roles \
  -H "Authorization: Bearer <token>"
```

### Get Role by ID

```bash
curl -X GET http://localhost:5000/api/roles/ROLE_ID \
  -H "Authorization: Bearer <token>"
```

### Create Role (Admin)

```bash
curl -X POST http://localhost:5000/api/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Role",
    "description": "Custom role description",
    "permissions": {
      "canViewDashboard": true,
      "canViewRecords": true,
      "canCreateRecords": false
    }
  }'
```

### Update Role (Admin)

```bash
curl -X PUT http://localhost:5000/api/roles/ROLE_ID \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": {
      "canCreateRecords": true
    }
  }'
```

---

## ✅ Health Check

```bash
curl http://localhost:5000/api/health
```

---

## 📋 Query Parameters Cheat Sheet

| Parameter   | Type   | Example                 |
| ----------- | ------ | ----------------------- |
| `page`      | number | `?page=2`               |
| `limit`     | number | `?limit=20`             |
| `type`      | string | `?type=income`          |
| `status`    | string | `?status=completed`     |
| `category`  | string | `?category=Salary`      |
| `startDate` | date   | `?startDate=2024-01-01` |
| `endDate`   | date   | `?endDate=2024-01-31`   |
| `minAmount` | number | `?minAmount=100`        |
| `maxAmount` | number | `?maxAmount=5000`       |
| `tags`      | string | `?tags=salary`          |
| `search`    | string | `?search=payment`       |
| `sortBy`    | string | `?sortBy=date-desc`     |
| `days`      | number | `?days=30`              |
| `year`      | number | `?year=2024`            |

---

## 🔐 Common Headers

```bash
# Content Type (for POST/PUT)
-H "Content-Type: application/json"

# Authentication
-H "Authorization: Bearer <TOKEN>"

# Combine both
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json"
```

---

## 💡 Common Workflows

### Complete Transaction Lifecycle

```bash
# 1. Create transaction
POST /api/records

# 2. Update transaction
PUT /api/records/:id

# 3. View statistics
GET /api/records/stats/overview

# 4. Export for reporting
GET /api/records/export/csv

# 5. Delete if needed (Admin)
DELETE /api/records/:id
```

### Monthly Report Generation

```bash
# 1. Get date range statistics
GET /api/analytics/summary?startDate=2024-01-01&endDate=2024-01-31

# 2. Get category breakdown
GET /api/analytics/category-breakdown?type=expense&startDate=2024-01-01&endDate=2024-01-31

# 3. Export all data
GET /api/records/export/csv?startDate=2024-01-01&endDate=2024-01-31
```

### Data Migration

```bash
# 1. Export old data
GET /api/records/export/json

# 2. Prepare data in bulk format

# 3. Import new data
POST /api/records/bulk/create

# 4. Verify import
GET /api/records/stats/overview
```

---

## 🚨 Error Codes Quick Reference

| Code | Meaning      | Solution            |
| ---- | ------------ | ------------------- |
| 200  | OK           | Success ✓           |
| 201  | Created      | Resource created ✓  |
| 400  | Bad Request  | Check input format  |
| 401  | Unauthorized | Check/refresh token |
| 403  | Forbidden    | Check user role     |
| 404  | Not Found    | Check resource ID   |
| 500  | Server Error | Check server logs   |

---

## 🛠️ Troubleshooting Quick Tips

| Issue                      | Solution                                |
| -------------------------- | --------------------------------------- |
| "Unauthorized"             | Check token, relogin if expired         |
| "Forbidden"                | Check user role for endpoint            |
| "Not found"                | Verify ID exists in database            |
| "Validation error"         | Check required fields in request        |
| "Duplicate transaction ID" | Use unique ID or check existing records |
| "Cannot create record"     | Verify user role (need Analyst+)        |
| "Cannot delete"            | Verify user role (Admin only)           |

---

## 📌 Remember

- ✅ Always include `Authorization` header
- ✅ Use ISO 8601 dates (`YYYY-MM-DD`)
- ✅ Token expires in 24 hours
- ✅ Pagination defaults: page=1, limit=10
- ✅ Transaction IDs must be unique
- ✅ Admin has all permissions
- ✅ Use filters to reduce data load

---

## 📚 Related Docs

- Full API: `API_DOCUMENTATION.md`
- Features: `FEATURES_OVERVIEW.md`
- Records: `FINANCIAL_RECORDS_MANAGEMENT.md`
- Setup: `README.md`
- Testing: `TESTING_GUIDE.md`

---

**Last Updated:** January 2024
**Print this page for quick reference!**
