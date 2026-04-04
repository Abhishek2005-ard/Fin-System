# Finance Dashboard Backend - API Testing Guide

## Quick Start

### 1. Start the Server

```bash
cd c:\Users\Admin\Desktop\Zorvyn\ Assignment\Fin-system
npm start
```

Expected output:

```
Server running on http://localhost:5000
Environment: development
MongoDB Connected: cluster0.j36oy1z.mongodb.net
Database: fin-system
```

### 2. Test Database Connection

```bash
curl http://localhost:5000/api/health
```

Expected response (200 OK):

```json
{
  "message": "Finance Dashboard Backend is running",
  "timestamp": "2026-04-03T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "status": "healthy",
    "responseTime": "245ms",
    "connection": {
      "status": "connected",
      "state": 1,
      "name": "fin-system",
      "host": "cluster0.j36oy1z.mongodb.net",
      "port": 27017
    },
    "collections": {
      "users": 0,
      "financialRecords": 0,
      "roles": 0,
      "total": 0
    }
  }
}
```

---

## Complete API Testing Workflow

### Phase 1: Initialize Roles

#### 1.1 Initialize Default Roles

```bash
POST http://localhost:5000/api/roles/init
```

Expected response (201 Created):

```json
{
  "success": true,
  "message": "Default roles initialized successfully",
  "count": 3,
  "data": [
    {
      "name": "Viewer",
      "description": "Can only view dashboard data"
    },
    {
      "name": "Analyst",
      "description": "Can view records and access insights"
    },
    {
      "name": "Admin",
      "description": "Full access - can manage everything"
    }
  ]
}
```

#### 1.2 Get All Roles

```bash
GET http://localhost:5000/api/roles
Authorization: Bearer <token>
```

---

### Phase 2: User Management

#### 2.1 Register Users

**Register Admin User:**

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Admin",
  "email": "admin@company.com",
  "password": "password123",
  "role": "Admin"
}
```

Expected response (201 Created):

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Admin",
    "email": "admin@company.com",
    "role": "Admin",
    "status": "active"
  }
}
```

**Register Analyst User:**

```bash
POST http://localhost:5000/api/auth/register

{
  "name": "Sarah Analyst",
  "email": "analyst@company.com",
  "password": "password456",
  "role": "Analyst"
}
```

**Register Viewer User:**

```bash
POST http://localhost:5000/api/auth/register

{
  "name": "Mike Viewer",
  "email": "viewer@company.com",
  "password": "password789",
  "role": "Viewer"
}
```

#### 2.2 Login and Get JWT Token

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}
```

Expected response (200 OK):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Admin",
    "email": "admin@company.com",
    "role": "Admin"
  }
}
```

#### 2.3 Get All Users (Admin Only)

```bash
GET http://localhost:5000/api/users
Authorization: Bearer <admin_token>
```

Expected response (200 OK):

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Admin",
      "email": "admin@company.com",
      "role": "Admin",
      "status": "active",
      "createdAt": "2026-04-03T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Sarah Analyst",
      "email": "analyst@company.com",
      "role": "Analyst",
      "status": "active",
      "createdAt": "2026-04-03T10:01:00.000Z"
    }
  ]
}
```

#### 2.4 Test Access Control - Viewer Cannot See Users List

```bash
GET http://localhost:5000/api/users
Authorization: Bearer <viewer_token>
```

Expected response (403 Forbidden):

```json
{
  "success": false,
  "message": "Access denied. Required permission: manageUsers"
}
```

---

### Phase 3: Financial Records Management

#### 3.1 Create Financial Records (Analyst/Admin Only)

```bash
POST http://localhost:5000/api/records
Authorization: Bearer <analyst_token>
Content-Type: application/json

{
  "transactionId": "TXN-001",
  "type": "income",
  "category": "Salary",
  "amount": 5000,
  "currency": "USD",
  "description": "Monthly salary",
  "date": "2026-04-01",
  "status": "completed",
  "tags": ["monthly", "salary"]
}
```

Expected response (201 Created):

```json
{
  "success": true,
  "message": "Financial record created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "transactionId": "TXN-001",
    "type": "income",
    "category": "Salary",
    "amount": 5000,
    "currency": "USD",
    "description": "Monthly salary",
    "date": "2026-04-01T00:00:00.000Z",
    "status": "completed",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Sarah Analyst",
      "email": "analyst@company.com"
    },
    "createdAt": "2026-04-03T10:05:00.000Z"
  }
}
```

**Create Multiple Records for Testing Analytics:**

```bash
# Expense 1
POST http://localhost:5000/api/records
{
  "transactionId": "TXN-002",
  "type": "expense",
  "category": "Groceries",
  "amount": 250,
  "date": "2026-04-01",
  "status": "completed"
}

# Expense 2
POST http://localhost:5000/api/records
{
  "transactionId": "TXN-003",
  "type": "expense",
  "category": "Utilities",
  "amount": 150,
  "date": "2026-04-02",
  "status": "completed"
}

# Income 2
POST http://localhost:5000/api/records
{
  "transactionId": "TXN-004",
  "type": "income",
  "category": "Freelance",
  "amount": 2000,
  "date": "2026-04-03",
  "status": "completed"
}
```

#### 3.2 Test Access Control - Viewer Cannot Create Records

```bash
POST http://localhost:5000/api/records
Authorization: Bearer <viewer_token>
Content-Type: application/json

{
  "transactionId": "TXN-005",
  "type": "expense",
  "category": "Entertainment",
  "amount": 100,
  "date": "2026-04-03"
}
```

Expected response (403 Forbidden):

```json
{
  "success": false,
  "message": "Access denied. Required permission: createRecords"
}
```

#### 3.3 Get All Records (Analyst/Admin Only)

```bash
GET http://localhost:5000/api/records
Authorization: Bearer <analyst_token>
```

Expected response (200 OK):

```json
{
  "success": true,
  "message": "Financial records retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "transactionId": "TXN-001",
      "type": "income",
      "category": "Salary",
      "amount": 5000,
      "status": "completed",
      "createdAt": "2026-04-03T10:05:00.000Z"
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "pages": 1,
    "limit": 10
  }
}
```

#### 3.4 Get Record by ID

```bash
GET http://localhost:5000/api/records/507f1f77bcf86cd799439020
Authorization: Bearer <analyst_token>
```

Expected response (200 OK):

```json
{
  "success": true,
  "message": "Financial record retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "transactionId": "TXN-001",
    "type": "income",
    "category": "Salary",
    "amount": 5000,
    "currency": "USD",
    "description": "Monthly salary",
    "status": "completed"
  }
}
```

#### 3.5 Update Record (Analyst/Admin Only)

```bash
PUT http://localhost:5000/api/records/507f1f77bcf86cd799439020
Authorization: Bearer <analyst_token>
Content-Type: application/json

{
  "amount": 5500,
  "description": "Monthly salary - updated",
  "status": "completed"
}
```

Expected response (200 OK):

```json
{
  "success": true,
  "message": "Financial record updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "transactionId": "TXN-001",
    "amount": 5500,
    "description": "Monthly salary - updated",
    "lastModifiedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Sarah Analyst"
    },
    "updatedAt": "2026-04-03T10:10:00.000Z"
  }
}
```

#### 3.6 Delete Record (Admin Only)

```bash
DELETE http://localhost:5000/api/records/507f1f77bcf86cd799439020
Authorization: Bearer <admin_token>
```

Expected response (200 OK):

```json
{
  "success": true,
  "message": "Financial record deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "transactionId": "TXN-001"
  }
}
```

#### 3.7 Test Viewer Can View But Not Modify

```bash
# Viewer CAN view records
GET http://localhost:5000/api/records
Authorization: Bearer <viewer_token>
# Status: 200 OK

# Viewer CANNOT update records
PUT http://localhost:5000/api/records/507f1f77bcf86cd799439021
Authorization: Bearer <viewer_token>
{
  "amount": 1000
}
# Expected: 403 Forbidden
```

---

### Phase 4: Analytics & Dashboard APIs

#### 4.1 Get Summary Analytics (Analyst/Admin Only)

```bash
GET http://localhost:5000/api/analytics/summary
Authorization: Bearer <analyst_token>
```

Expected response (200 OK):

```json
{
  "message": "Summary analytics retrieved successfully",
  "data": {
    "totalIncome": 7000,
    "totalExpenses": 400,
    "totalTransfers": 0,
    "netBalance": 6600,
    "transactionCount": 4,
    "period": {
      "startDate": "All time",
      "endDate": "All time"
    }
  }
}
```

#### 4.2 Get Category Breakdown

```bash
GET http://localhost:5000/api/analytics/category-breakdown?type=expense
Authorization: Bearer <analyst_token>
```

Expected response (200 OK):

```json
{
  "message": "Category breakdown retrieved successfully",
  "data": [
    {
      "_id": "Groceries",
      "total": 250,
      "count": 1
    },
    {
      "_id": "Utilities",
      "total": 150,
      "count": 1
    }
  ],
  "type": "expense"
}
```

#### 4.3 Get Monthly Trends

```bash
GET http://localhost:5000/api/analytics/monthly-trends?year=2026
Authorization: Bearer <analyst_token>
```

Expected response (200 OK):

```json
{
  "message": "Monthly trends retrieved successfully",
  "data": [
    {
      "_id": {
        "year": 2026,
        "month": 4,
        "type": "income"
      },
      "total": 7000,
      "count": 2
    }
  ],
  "year": 2026,
  "type": "all"
}
```

#### 4.4 Get Dashboard Overview

```bash
GET http://localhost:5000/api/analytics/dashboard-overview?days=30
Authorization: Bearer <analyst_token>
```

Expected response (200 OK):

```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "summary": {
      "totalIncome": 7000,
      "totalExpenses": 400,
      "netBalance": 6600,
      "transactionCount": 4
    },
    "topCategories": [
      {
        "_id": "Groceries",
        "total": 250
      }
    ],
    "recentRecords": [],
    "period": {
      "days": 30,
      "from": "2026-03-04T10:00:00.000Z",
      "to": "2026-04-03T10:00:00.000Z"
    }
  }
}
```

#### 4.5 Get Basic Dashboard (Viewer Only)

```bash
GET http://localhost:5000/api/analytics/basic-dashboard
Authorization: Bearer <viewer_token>
```

Expected response (200 OK):

```json
{
  "success": true,
  "message": "Basic dashboard data retrieved successfully",
  "data": {
    "totalRecords": 4,
    "totalUsers": 3,
    "systemStatus": "Operational"
  }
}
```

#### 4.6 Viewer Cannot Access Detailed Analytics

```bash
GET http://localhost:5000/api/analytics/summary
Authorization: Bearer <viewer_token>
```

Expected response (403 Forbidden):

```json
{
  "success": false,
  "message": "Access denied. Required permission: accessInsights"
}
```

---

### Phase 5: Validation & Error Handling

#### 5.1 Test Validation - Missing Required Field

```bash
POST http://localhost:5000/api/records
Authorization: Bearer <analyst_token>
Content-Type: application/json

{
  "transactionId": "TXN-TEST",
  "type": "income",
  "amount": 1000
  // Missing: category, date
}
```

Expected response (400 Bad Request):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "category",
      "message": "Category is required",
      "value": undefined
    },
    {
      "field": "date",
      "message": "Date must be in ISO format",
      "value": undefined
    }
  ]
}
```

#### 5.2 Test Validation - Invalid Amount

```bash
POST http://localhost:5000/api/records
Authorization: Bearer <analyst_token>
Content-Type: application/json

{
  "transactionId": "TXN-TEST2",
  "type": "expense",
  "category": "Test",
  "amount": -100,
  "date": "2026-04-03"
}
```

Expected response (400 Bad Request):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be a positive number greater than 0",
      "value": -100
    }
  ]
}
```

#### 5.3 Test Validation - Invalid Email

```bash
POST http://localhost:5000/api/auth/register

{
  "name": "Test User",
  "email": "invalid-email",
  "password": "password123"
}
```

Expected response (400 Bad Request):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```

#### 5.4 Test 404 Not Found

```bash
GET http://localhost:5000/api/records/invalid-id
Authorization: Bearer <analyst_token>
```

Expected response (400 Bad Request):

```json
{
  "success": false,
  "message": "Invalid record ID format",
  "error": "The provided ID is not a valid MongoDB ObjectId"
}
```

#### 5.5 Test Duplicate Transaction ID

```bash
POST http://localhost:5000/api/records
Authorization: Bearer <analyst_token>
Content-Type: application/json

{
  "transactionId": "TXN-001",
  "type": "income",
  "category": "Salary",
  "amount": 3000,
  "date": "2026-04-03"
}
```

Expected response (409 Conflict):

```json
{
  "success": false,
  "message": "Duplicate transaction ID",
  "error": "A record with this transaction ID already exists"
}
```

---

### Phase 6: Database Status & Monitoring

#### 6.1 Get Database Status (Admin Only)

```bash
GET http://localhost:5000/api/admin/database-status
Authorization: Bearer <admin_token>
```

Expected response (200 OK):

```json
{
  "message": "Database status retrieved successfully",
  "timestamp": "2026-04-03T10:15:00.000Z",
  "stats": {
    "database": "fin-system",
    "collections": 3,
    "objects": 7,
    "dataSize": 2048,
    "storageSize": 4096,
    "indexes": 8,
    "indexSize": 1024,
    "collectionDetails": {
      "users": {
        "count": 3,
        "size": 512,
        "avgObjSize": 170
      },
      "financialRecords": {
        "count": 4,
        "size": 1536,
        "avgObjSize": 384
      }
    }
  },
  "counts": {
    "users": 3,
    "financialRecords": 4,
    "roles": 3,
    "total": 10
  }
}
```

---

## Summary of Access Control

| Operation        | Viewer | Analyst | Admin |
| ---------------- | ------ | ------- | ----- |
| View Dashboard   | ✓      | ✓       | ✓     |
| View Records     | ✗      | ✓       | ✓     |
| Create Records   | ✗      | ✓       | ✓     |
| Update Records   | ✗      | ✓       | ✓     |
| Delete Records   | ✗      | ✗       | ✓     |
| Access Analytics | ✗      | ✓       | ✓     |
| Manage Users     | ✗      | ✗       | ✓     |
| Manage Roles     | ✗      | ✗       | ✓     |

---

## Common Error Codes

| Code | Meaning      | Example                           |
| ---- | ------------ | --------------------------------- |
| 200  | Success      | Record retrieved                  |
| 201  | Created      | User registered                   |
| 400  | Bad Request  | Invalid input                     |
| 401  | Unauthorized | Missing/invalid token             |
| 403  | Forbidden    | Insufficient permissions          |
| 404  | Not Found    | Record ID doesn't exist           |
| 409  | Conflict     | Duplicate email or transaction ID |
| 500  | Server Error | Database connection error         |

---

## Testing Tools

### Using cURL

All examples above use standard curl commands

### Using Postman

1. Import the API_DOCUMENTATION.md endpoints
2. Create collection variables:
   - `admin_token`: Token from admin login
   - `analyst_token`: Token from analyst login
   - `viewer_token`: Token from viewer login
3. Use Authorization header: `Authorization: Bearer {{admin_token}}`

### Using Thunder Client or VS Code REST Client

Create `.http` files with the request examples above

---

## Performance Notes

- Pagination: Default limit 10, max limit 100
- Indexes optimized for common queries
- Response times typically under 500ms
- Database connection pool: 10 connections

---

## Important: Test Sequence

1. ✓ Start server
2. ✓ Check health endpoint
3. ✓ Initialize roles
4. ✓ Register users (Admin, Analyst, Viewer)
5. ✓ Test login for each role
6. ✓ Create financial records
7. ✓ Test access control (try operations with wrong roles)
8. ✓ Test analytics endpoints
9. ✓ Test validation/error handling
10. ✓ Check database status
