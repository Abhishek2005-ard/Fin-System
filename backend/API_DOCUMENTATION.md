# Finance Dashboard Backend API Documentation

## Overview

This is a comprehensive backend API for a finance dashboard system with role-based access control (RBAC). The system supports three user roles: **Viewer**, **Analyst**, and **Admin**, each with specific permissions.

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Role Management](#role-management)
4. [Financial Records](#financial-records)
5. [Analytics](#analytics)
6. [Error Handling](#error-handling)

---

## Authentication

### Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user with email and password.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "roleId": "609c1ff0e9c3b4a1f0c1e1a1"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "609c1ff0e9c3b4a1f0c1e1b2",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active"
  }
}
```

---

### Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "609c1ff0e9c3b4a1f0c1e1b2",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "status": "active"
  }
}
```

**Note:** Use the token in the `Authorization` header as `Bearer <token>` for subsequent requests.

---

## User Management

### Get All Users

**Endpoint:** `GET /api/users`

**Authorization:** Admin only

**Query Parameters:**

- None

**Response (200):**

```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "609c1ff0e9c3b4a1f0c1e1b2",
      "name": "John Doe",
      "email": "john@example.com",
      "role": {
        "_id": "609c1ff0e9c3b4a1f0c1e1a1",
        "name": "Admin",
        "permissions": { ... }
      },
      "status": "active",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get User by ID

**Endpoint:** `GET /api/users/:id`

**Authorization:** Any authenticated user (can view own profile)

**Response (200):**

```json
{
  "message": "User retrieved successfully",
  "data": { ... }
}
```

---

### Create User

**Endpoint:** `POST /api/users`

**Authorization:** Admin only

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword",
  "roleId": "609c1ff0e9c3b4a1f0c1e1a2",
  "status": "active"
}
```

**Response (201):**

```json
{
  "message": "User created successfully",
  "data": { ... }
}
```

---

### Update User

**Endpoint:** `PUT /api/users/:id`

**Authorization:** Admin only

**Request Body:**

```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "roleId": "609c1ff0e9c3b4a1f0c1e1a3"
}
```

**Response (200):**

```json
{
  "message": "User updated successfully",
  "data": { ... }
}
```

---

### Delete User

**Endpoint:** `DELETE /api/users/:id`

**Authorization:** Admin only

**Response (200):**

```json
{
  "message": "User deleted successfully",
  "data": { ... }
}
```

---

### Change User Status

**Endpoint:** `PATCH /api/users/:id/status`

**Authorization:** Admin only

**Request Body:**

```json
{
  "status": "inactive"
}
```

**Response (200):**

```json
{
  "message": "User status updated successfully",
  "data": { ... }
}
```

---

## Role Management

### Initialize Default Roles

**Endpoint:** `POST /api/roles/initialize`

**Authorization:** Public

**Description:** Create default roles (Viewer, Analyst, Admin) with their permissions.

**Response (201):**

```json
{
  "message": "Default roles initialized successfully",
  "data": [
    {
      "_id": "609c1ff0e9c3b4a1f0c1e1a1",
      "name": "Viewer",
      "description": "Can only view dashboard data",
      "permissions": {
        "canViewDashboard": true,
        "canViewRecords": false,
        "canAccessInsights": false,
        "canCreateRecords": false,
        "canUpdateRecords": false,
        "canDeleteRecords": false,
        "canManageUsers": false,
        "canManageRoles": false
      }
    },
    {
      "_id": "609c1ff0e9c3b4a1f0c1e1a2",
      "name": "Analyst",
      "description": "Can view records and access insights",
      "permissions": {
        "canViewDashboard": true,
        "canViewRecords": true,
        "canAccessInsights": true,
        "canCreateRecords": false,
        "canUpdateRecords": false,
        "canDeleteRecords": false,
        "canManageUsers": false,
        "canManageRoles": false
      }
    },
    {
      "_id": "609c1ff0e9c3b4a1f0c1e1a3",
      "name": "Admin",
      "description": "Can create, update, manage records and users",
      "permissions": {
        "canViewDashboard": true,
        "canViewRecords": true,
        "canAccessInsights": true,
        "canCreateRecords": true,
        "canUpdateRecords": true,
        "canDeleteRecords": true,
        "canManageUsers": true,
        "canManageRoles": true
      }
    }
  ]
}
```

---

### Get All Roles

**Endpoint:** `GET /api/roles`

**Authorization:** Any authenticated user

**Response (200):**

```json
{
  "message": "Roles retrieved successfully",
  "data": [ ... ]
}
```

---

### Get Role by ID

**Endpoint:** `GET /api/roles/:id`

**Authorization:** Any authenticated user

**Response (200):**

```json
{
  "message": "Role retrieved successfully",
  "data": { ... }
}
```

---

### Create Role

**Endpoint:** `POST /api/roles`

**Authorization:** Admin only

**Request Body:**

```json
{
  "name": "Viewer",
  "description": "Can only view dashboard data",
  "permissions": {
    "canViewDashboard": true,
    "canViewRecords": false,
    "canAccessInsights": false
  }
}
```

**Response (201):**

```json
{
  "message": "Role created successfully",
  "data": { ... }
}
```

---

### Update Role

**Endpoint:** `PUT /api/roles/:id`

**Authorization:** Admin only

**Request Body:**

```json
{
  "description": "Updated description",
  "permissions": {
    "canViewRecords": true
  }
}
```

**Response (200):**

```json
{
  "message": "Role updated successfully",
  "data": { ... }
}
```

---

## Financial Records

### Get All Financial Records

**Endpoint:** `GET /api/records`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `type` (optional: "income", "expense", "transfer")
- `status` (optional: "pending", "completed", "failed")

**Example:** `GET /api/records?page=1&limit=10&type=income&status=completed`

**Response (200):**

```json
{
  "message": "Financial records retrieved successfully",
  "data": [
    {
      "_id": "609c1ff0e9c3b4a1f0c1e1c1",
      "transactionId": "TXN001",
      "type": "income",
      "category": "Salary",
      "amount": 5000,
      "currency": "USD",
      "description": "Monthly salary",
      "date": "2024-01-15T00:00:00Z",
      "status": "completed",
      "createdBy": {
        "_id": "609c1ff0e9c3b4a1f0c1e1b2",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "tags": ["salary", "monthly"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

---

### Get Record by ID

**Endpoint:** `GET /api/records/:id`

**Authorization:** Analyst, Admin

**Response (200):**

```json
{
  "message": "Financial record retrieved successfully",
  "data": { ... }
}
```

---

### Create Financial Record

**Endpoint:** `POST /api/records`

**Authorization:** Analyst, Admin

**Request Body:**

```json
{
  "transactionId": "TXN001",
  "type": "income",
  "category": "Salary",
  "amount": 5000,
  "currency": "USD",
  "description": "Monthly salary",
  "date": "2024-01-15",
  "status": "completed",
  "tags": ["salary", "monthly"],
  "attachment": "url_to_attachment"
}
```

**Response (201):**

```json
{
  "message": "Financial record created successfully",
  "data": { ... }
}
```

---

### Update Financial Record

**Endpoint:** `PUT /api/records/:id`

**Authorization:** Analyst, Admin

**Request Body:**

```json
{
  "type": "income",
  "category": "Bonus",
  "amount": 10000,
  "description": "Annual bonus",
  "status": "completed"
}
```

**Response (200):**

```json
{
  "message": "Financial record updated successfully",
  "data": { ... }
}
```

---

### Delete Financial Record

**Endpoint:** `DELETE /api/records/:id`

**Authorization:** Admin only

**Response (200):**

```json
{
  "message": "Financial record deleted successfully",
  "data": { ... }
}
```

---

### Get Records by User

**Endpoint:** `GET /api/records/user/:userId`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**

```json
{
  "message": "User financial records retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## Analytics

### Get Summary Analytics

**Endpoint:** `GET /api/analytics/summary`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `startDate` (optional, ISO format)
- `endDate` (optional, ISO format)

**Example:** `GET /api/analytics/summary?startDate=2024-01-01&endDate=2024-01-31`

**Response (200):**

```json
{
  "message": "Summary analytics retrieved successfully",
  "data": {
    "totalIncome": 50000,
    "totalExpenses": 20000,
    "totalTransfers": 5000,
    "netBalance": 30000,
    "transactionCount": 150,
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

---

### Get Category Breakdown

**Endpoint:** `GET /api/analytics/category-breakdown`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `type` (optional: "income", "expense", "transfer", default: "expense")
- `startDate` (optional, ISO format)
- `endDate` (optional, ISO format)

**Example:** `GET /api/analytics/category-breakdown?type=expense`

**Response (200):**

```json
{
  "message": "Category breakdown retrieved successfully",
  "data": [
    {
      "_id": "Groceries",
      "total": 5000,
      "count": 45
    },
    {
      "_id": "Utilities",
      "total": 3000,
      "count": 12
    }
  ],
  "type": "expense"
}
```

---

### Get Monthly Trends

**Endpoint:** `GET /api/analytics/monthly-trends`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `year` (optional, default: current year)
- `type` (optional: "income", "expense", "transfer")

**Example:** `GET /api/analytics/monthly-trends?year=2024&type=income`

**Response (200):**

```json
{
  "message": "Monthly trends retrieved successfully",
  "data": [
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "type": "income"
      },
      "total": 50000,
      "count": 25
    }
  ],
  "year": 2024,
  "type": "income"
}
```

---

### Get Weekly Trends

**Endpoint:** `GET /api/analytics/weekly-trends`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `year` (optional, default: current year)
- `type` (optional: "income", "expense", "transfer")
- `startDate` (optional, ISO format)
- `endDate` (optional, ISO format)

**Example:** `GET /api/analytics/weekly-trends?year=2024&type=expense`

**Response (200):**

```json
{
  "message": "Weekly trends retrieved successfully",
  "data": [
    {
      "_id": {
        "year": 2024,
        "week": 1,
        "type": "expense"
      },
      "total": 1500,
      "count": 8
    }
  ],
  "year": 2024,
  "type": "expense"
}
```

---

### Get Transaction Status Distribution

**Endpoint:** `GET /api/analytics/transaction-status`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `startDate` (optional, ISO format)
- `endDate` (optional, ISO format)

**Response (200):**

```json
{
  "message": "Transaction status distribution retrieved successfully",
  "data": [
    {
      "_id": "completed",
      "count": 140,
      "totalAmount": 75000
    },
    {
      "_id": "pending",
      "count": 8,
      "totalAmount": 2000
    },
    {
      "_id": "failed",
      "count": 2,
      "totalAmount": 500
    }
  ]
}
```

---

### Get Dashboard Overview

**Endpoint:** `GET /api/analytics/dashboard-overview`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `days` (optional, default: 30)

**Example:** `GET /api/analytics/dashboard-overview?days=30`

**Response (200):**

```json
{
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "summary": {
      "totalIncome": 50000,
      "totalExpenses": 20000,
      "netBalance": 30000,
      "transactionCount": 150
    },
    "topCategories": [
      {
        "_id": "Groceries",
        "total": 5000
      }
    ],
    "recentRecords": [ ... ],
    "period": {
      "days": 30,
      "from": "2023-12-16T10:30:00Z",
      "to": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

**Common Error Responses:**

### 400 Bad Request

```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized: Invalid token"
}
```

### 403 Forbidden

```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update values as needed

3. **Initialize default roles:**
   - Call `POST /api/roles/initialize` before creating users

4. **Start the server:**

   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

5. **Test endpoints:**
   - Use Postman, Thunder Client, or curl to test endpoints
   - Include the JWT token in the Authorization header for protected routes

---

## Permission Matrix

| Feature         | Viewer | Analyst | Admin |
| --------------- | ------ | ------- | ----- |
| View Dashboard  | ✓      | ✓       | ✓     |
| View Records    | ✗      | ✓       | ✓     |
| Access Insights | ✗      | ✓       | ✓     |
| Create Records  | ✗      | ✓       | ✓     |
| Update Records  | ✗      | ✓       | ✓     |
| Delete Records  | ✗      | ✗       | ✓     |
| Manage Users    | ✗      | ✗       | ✓     |
| Manage Roles    | ✗      | ✗       | ✓     |

---

## Additional Notes

- JWT tokens expire after 24 hours
- All timestamps are in UTC ISO 8601 format
- Passwords are hashed using bcrypt before storage
- Pagination defaults: page=1, limit=10
- Database: MongoDB
