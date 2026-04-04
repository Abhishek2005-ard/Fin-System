# Testing Guide - Finance Dashboard API

This guide will help you test all the features of the Finance Dashboard Backend API.

## Prerequisites

- Postman, Thunder Client, or any API testing tool
- Running MongoDB instance
- Server running locally on `http://localhost:5000`

## Testing Workflow

### Step 1: Test Health Check

**Endpoint:** `GET /api/health`

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**

```json
{
  "message": "Finance Dashboard Backend is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

### Step 2: Initialize Default Roles

**Endpoint:** `POST /api/roles/initialize`

```bash
curl -X POST http://localhost:5000/api/roles/initialize \
  -H "Content-Type: application/json"
```

**Expected Response:** Three default roles (Viewer, Analyst, Admin) are created.

**Save the Role IDs from the response:**

- Viewer Role ID: \***\*\_\_\_\*\***
- Analyst Role ID: \***\*\_\_\_\*\***
- Admin Role ID: \***\*\_\_\_\*\***

---

### Step 3: Register Users with Different Roles

#### Register Admin User

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123456",
    "roleId": "<Admin-Role-ID>"
  }'
```

#### Register Analyst User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Analyst User",
    "email": "analyst@example.com",
    "password": "analyst123456",
    "roleId": "<Analyst-Role-ID>"
  }'
```

#### Register Viewer User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Viewer User",
    "email": "viewer@example.com",
    "password": "viewer123456",
    "roleId": "<Viewer-Role-ID>"
  }'
```

---

### Step 4: Login with Each User

#### Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }'
```

**Save the JWT Token:** `admin_token = "___________"`

#### Login as Analyst

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "analyst123456"
  }'
```

**Save the JWT Token:** `analyst_token = "___________"`

#### Login as Viewer

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@example.com",
    "password": "viewer123456"
  }'
```

**Save the JWT Token:** `viewer_token = "___________"`

---

### Step 5: Test User Management (Admin Only)

#### Get All Users (Should work with Admin token)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>"
```

#### Get All Users (Should fail with Analyst token)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <analyst_token>"
```

**Expected:** 403 Forbidden

#### Get User by ID

```bash
curl -X GET http://localhost:5000/api/users/<user-id> \
  -H "Authorization: Bearer <admin_token>"
```

#### Create New User (Admin Only)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "newuser123456",
    "roleId": "<Analyst-Role-ID>",
    "status": "active"
  }'
```

#### Update User (Admin Only)

```bash
curl -X PUT http://localhost:5000/api/users/<user-id> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "status": "active"
  }'
```

#### Change User Status

```bash
curl -X PATCH http://localhost:5000/api/users/<user-id>/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

#### Delete User (Admin Only)

```bash
curl -X DELETE http://localhost:5000/api/users/<user-id> \
  -H "Authorization: Bearer <admin_token>"
```

---

### Step 6: Test Role Management

#### Get All Roles

```bash
curl -X GET http://localhost:5000/api/roles \
  -H "Authorization: Bearer <admin_token>"
```

#### Get Role by ID

```bash
curl -X GET http://localhost:5000/api/roles/<role-id> \
  -H "Authorization: Bearer <admin_token>"
```

#### Update Role Permissions

```bash
curl -X PUT http://localhost:5000/api/roles/<role-id> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "permissions": {
      "canViewDashboard": true,
      "canViewRecords": true
    }
  }'
```

---

### Step 7: Test Financial Records (Analyst & Admin)

#### Create Financial Record (Analyst Can Do This)

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <analyst_token>" \
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

**Save the Record ID:** `record_id = "___________"`

#### Create Multiple Income Records

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <analyst_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN002",
    "type": "income",
    "category": "Bonus",
    "amount": 3000,
    "currency": "USD",
    "description": "Performance bonus",
    "date": "2024-01-20",
    "status": "completed"
  }'
```

#### Create Expense Records

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <analyst_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN003",
    "type": "expense",
    "category": "Groceries",
    "amount": 150,
    "currency": "USD",
    "description": "Weekly groceries",
    "date": "2024-01-16",
    "status": "completed"
  }'
```

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <analyst_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN004",
    "type": "expense",
    "category": "Utilities",
    "amount": 100,
    "currency": "USD",
    "description": "Electricity bill",
    "date": "2024-01-18",
    "status": "completed"
  }'
```

#### Get All Financial Records

```bash
curl -X GET "http://localhost:5000/api/records?page=1&limit=10" \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Record by ID

```bash
curl -X GET http://localhost:5000/api/records/<record_id> \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Records with Filters

```bash
# Get income records only
curl -X GET "http://localhost:5000/api/records?type=income&status=completed" \
  -H "Authorization: Bearer <analyst_token>"

# Get expense records
curl -X GET "http://localhost:5000/api/records?type=expense" \
  -H "Authorization: Bearer <analyst_token>"
```

#### Update Financial Record

```bash
curl -X PUT http://localhost:5000/api/records/<record_id> \
  -H "Authorization: Bearer <analyst_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5500,
    "description": "Updated salary amount",
    "status": "completed"
  }'
```

#### Test Viewer Cannot Access Records (Should Fail)

```bash
curl -X GET http://localhost:5000/api/records \
  -H "Authorization: Bearer <viewer_token>"
```

**Expected:** 403 Forbidden

#### Delete Record (Admin Only)

```bash
curl -X DELETE http://localhost:5000/api/records/<record_id> \
  -H "Authorization: Bearer <admin_token>"
```

#### Get Records by User

```bash
curl -X GET "http://localhost:5000/api/records/user/<user_id>" \
  -H "Authorization: Bearer <analyst_token>"
```

---

### Step 8: Test Analytics (Analyst & Admin Only)

#### Get Summary Analytics

```bash
curl -X GET http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Summary with Date Range

```bash
curl -X GET "http://localhost:5000/api/analytics/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Category Breakdown

```bash
curl -X GET "http://localhost:5000/api/analytics/category-breakdown?type=expense" \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Monthly Trends

```bash
curl -X GET "http://localhost:5000/api/analytics/monthly-trends?year=2024&type=income" \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Weekly Trends

```bash
curl -X GET "http://localhost:5000/api/analytics/weekly-trends?year=2024&type=expense" \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Transaction Status Distribution

```bash
curl -X GET http://localhost:5000/api/analytics/transaction-status \
  -H "Authorization: Bearer <analyst_token>"
```

#### Get Dashboard Overview

```bash
curl -X GET "http://localhost:5000/api/analytics/dashboard-overview?days=30" \
  -H "Authorization: Bearer <analyst_token>"
```

#### Test Viewer Cannot Access Analytics (Should Fail)

```bash
curl -X GET http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer <viewer_token>"
```

**Expected:** 403 Forbidden

---

### Step 9: Test Permission Restrictions

#### Admin Creates Record (Should Work)

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN005",
    "type": "transfer",
    "category": "Transfer",
    "amount": 1000,
    "currency": "USD",
    "description": "Transfer to savings",
    "date": "2024-01-20",
    "status": "pending"
  }'
```

#### Viewer Cannot Create Records (Should Fail)

```bash
curl -X POST http://localhost:5000/api/records \
  -H "Authorization: Bearer <viewer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN006",
    "type": "expense",
    "category": "Food",
    "amount": 50,
    "currency": "USD",
    "description": "Restaurant",
    "date": "2024-01-22",
    "status": "completed"
  }'
```

**Expected:** 403 Forbidden

#### Analyst Cannot Delete Records (Should Fail)

```bash
curl -X DELETE http://localhost:5000/api/records/<record_id> \
  -H "Authorization: Bearer <analyst_token>"
```

**Expected:** 403 Forbidden (or operation not allowed for analyst)

#### Analyst Cannot Manage Users (Should Fail)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <analyst_token>"
```

**Expected:** 403 Forbidden

---

### Step 10: Test Error Handling

#### Invalid Token

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer invalid-token"
```

**Expected:** 401 Unauthorized

#### Missing Token

```bash
curl -X GET http://localhost:5000/api/users
```

**Expected:** 401 Unauthorized

#### Invalid Email Format

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "password123",
    "roleId": "<Role-ID>"
  }'
```

**Expected:** 400 Bad Request

#### Duplicate Email

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Admin",
    "email": "admin@example.com",
    "password": "admin123456",
    "roleId": "<Admin-Role-ID>"
  }'
```

**Expected:** 400 Bad Request (User already exists)

#### Invalid Role ID

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456",
    "roleId": "invalid-role-id"
  }'
```

**Expected:** 400 Bad Request

---

## Summary of Test Results

Create a test summary table:

| Test Case               | Expected Result  | Actual Result | Status |
| ----------------------- | ---------------- | ------------- | ------ |
| Health Check            | 200 OK           |               | ✓/✗    |
| Initialize Roles        | 201 Created      |               | ✓/✗    |
| Admin Register          | 201 Created      |               | ✓/✗    |
| Admin Login             | 200 OK + Token   |               | ✓/✗    |
| Get Users (Admin)       | 200 OK           |               | ✓/✗    |
| Get Users (Analyst)     | 403 Forbidden    |               | ✓/✗    |
| Create Record (Analyst) | 201 Created      |               | ✓/✗    |
| Create Record (Viewer)  | 403 Forbidden    |               | ✓/✗    |
| Get Analytics (Analyst) | 200 OK           |               | ✓/✗    |
| Get Analytics (Viewer)  | 403 Forbidden    |               | ✓/✗    |
| Invalid Token           | 401 Unauthorized |               | ✓/✗    |

---

## Postman Collection (Quick Setup)

### Environment Variables

```json
{
  "base_url": "http://localhost:5000",
  "admin_token": "your_admin_token",
  "analyst_token": "your_analyst_token",
  "viewer_token": "your_viewer_token",
  "admin_id": "admin_user_id",
  "record_id": "test_record_id"
}
```

### Pre-request Script

```javascript
// For authenticated requests, use:
// Authorization: Bearer {{admin_token}}
```

---

## Notes

- All endpoints require the `Content-Type: application/json` header for POST/PUT requests
- JWT tokens expire after 24 hours
- Each financial record must have a unique `transactionId`
- Test with different roles to understand permission boundaries
- Create multiple records before testing analytics endpoints
- Date format: ISO 8601 (YYYY-MM-DD or ISO string)

---

## Next Steps

1. ✅ Run all curl commands to test each endpoint
2. ✅ Verify response codes and data structure
3. ✅ Test permission restrictions for each role
4. ✅ Verify error handling
5. ✅ Connect with frontend application
6. ✅ Add additional features as needed
