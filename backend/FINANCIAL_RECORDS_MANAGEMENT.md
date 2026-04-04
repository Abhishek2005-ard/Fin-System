# Enhanced Financial Records Management API

This document describes all the enhanced features added to the Financial Records Management API.

## Table of Contents

1. [Basic CRUD Operations](#basic-crud-operations)
2. [Advanced Search & Filtering](#advanced-search--filtering)
3. [Bulk Operations](#bulk-operations)
4. [Export Features](#export-features)
5. [Statistics & Analytics](#statistics--analytics)
6. [Updated Feature Matrix](#updated-feature-matrix)

---

## Basic CRUD Operations

These endpoints handle the fundamental create, read, update, and delete operations for financial records.

### Get All Financial Records

**Endpoint:** `GET /api/records`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `type` (optional: "income", "expense", "transfer")
- `status` (optional: "pending", "completed", "failed")

**Example:**

```bash
curl -X GET "http://localhost:5000/api/records?page=1&limit=10&type=income&status=completed" \
  -H "Authorization: Bearer <token>"
```

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
      "createdBy": { ... },
      "tags": ["salary", "monthly"],
      "createdAt": "2024-01-15T10:30:00Z"
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
  "amount": 5500,
  "description": "Updated salary",
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

**Response (200):**

```json
{
  "message": "User financial records retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## Advanced Search & Filtering

### Advanced Search with Multiple Filters

**Endpoint:** `GET /api/records/search/advanced`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `type` (optional: "income", "expense", "transfer")
- `status` (optional: "pending", "completed", "failed")
- `category` (optional: case-insensitive search)
- `startDate` (optional: ISO format date)
- `endDate` (optional: ISO format date)
- `minAmount` (optional: numeric value)
- `maxAmount` (optional: numeric value)
- `tags` (optional: single tag or array of tags)
- `search` (optional: full-text search in description)
- `sortBy` (optional: "date-desc", "date-asc", "amount-desc", "amount-asc", "category", "recent", "oldest")

**Examples:**

**Find all expenses in Groceries category between 2024-01-01 and 2024-01-31:**

```bash
curl -X GET "http://localhost:5000/api/records/search/advanced?type=expense&category=Groceries&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

**Find high-value transactions (over $1000):**

```bash
curl -X GET "http://localhost:5000/api/records/search/advanced?minAmount=1000&sortBy=amount-desc" \
  -H "Authorization: Bearer <token>"
```

**Search by tags and amount range:**

```bash
curl -X GET "http://localhost:5000/api/records/search/advanced?tags=monthly&minAmount=100&maxAmount=5000" \
  -H "Authorization: Bearer <token>"
```

**Search with full-text search:**

```bash
curl -X GET "http://localhost:5000/api/records/search/advanced?search=salary+bonus" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "message": "Records search completed successfully",
  "data": [ ... ],
  "statistics": {
    "totalRecords": 15,
    "totalIncome": 50000,
    "totalExpense": 10000,
    "totalTransfer": 5000,
    "totalAmount": 65000,
    "averageTransaction": 4333.33,
    "byType": {
      "income": 8,
      "expense": 5,
      "transfer": 2
    },
    "byStatus": {
      "pending": 2,
      "completed": 12,
      "failed": 1
    },
    "byCategory": {
      "Salary": 50000,
      "Bonus": 10000
    }
  },
  "pagination": {
    "total": 15,
    "page": 1,
    "pages": 2,
    "limit": 10
  },
  "filters": {
    "type": "all",
    "status": "all",
    "category": "Groceries",
    "dateRange": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "amountRange": {
      "min": "all",
      "max": "all"
    }
  }
}
```

---

## Bulk Operations

### Create Multiple Records

**Endpoint:** `POST /api/records/bulk/create`

**Authorization:** Analyst, Admin

**Request Body:**

```json
[
  {
    "transactionId": "TXN100",
    "type": "income",
    "category": "Salary",
    "amount": 5000,
    "currency": "USD",
    "description": "Monthly salary",
    "date": "2024-01-15",
    "status": "completed"
  },
  {
    "transactionId": "TXN101",
    "type": "expense",
    "category": "Groceries",
    "amount": 150,
    "currency": "USD",
    "description": "Weekly groceries",
    "date": "2024-01-16",
    "status": "completed"
  },
  {
    "transactionId": "TXN102",
    "type": "expense",
    "category": "Utilities",
    "amount": 100,
    "currency": "USD",
    "description": "Electricity bill",
    "date": "2024-01-17",
    "status": "completed"
  }
]
```

**Response (201):**

```json
{
  "message": "Created 3 out of 3 records",
  "data": {
    "successful": 3,
    "failed": 0,
    "records": [ ... ],
    "errors": null
  }
}
```

**Response with Partial Errors (201):**

```json
{
  "message": "Created 2 out of 3 records",
  "data": {
    "successful": 2,
    "failed": 1,
    "records": [ ... ],
    "errors": [
      {
        "index": 2,
        "data": { ... },
        "errors": ["Transaction ID already exists"]
      }
    ]
  }
}
```

---

### Delete Multiple Records

**Endpoint:** `POST /api/records/bulk/delete`

**Authorization:** Admin only

**Request Body:**

```json
{
  "recordIds": [
    "609c1ff0e9c3b4a1f0c1e1c1",
    "609c1ff0e9c3b4a1f0c1e1c2",
    "609c1ff0e9c3b4a1f0c1e1c3"
  ]
}
```

**Response (200):**

```json
{
  "message": "Successfully deleted 3 records",
  "data": {
    "deletedCount": 3,
    "requestedCount": 3
  }
}
```

---

## Export Features

### Export Records as CSV

**Endpoint:** `GET /api/records/export/csv`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `type` (optional: "income", "expense", "transfer")
- `status` (optional: "pending", "completed", "failed")
- `category` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `minAmount` (optional)
- `maxAmount` (optional)

**Example:**

```bash
curl -X GET "http://localhost:5000/api/records/export/csv?type=expense&category=Groceries" \
  -H "Authorization: Bearer <token>" \
  --output financial-records.csv
```

**Response (200):** CSV file with headers:

```
Transaction ID,Type,Category,Amount,Currency,Description,Date,Status,Tags,Created At,Updated At
TXN001,income,Salary,5000,USD,Monthly salary,01/15/2024,completed,salary; monthly,01/15/2024 10:30:00,01/15/2024 10:30:00
TXN002,expense,Groceries,150,USD,Weekly groceries,01/16/2024,completed,,01/16/2024 11:00:00,01/16/2024 11:00:00
```

---

### Export Records as JSON

**Endpoint:** `GET /api/records/export/json`

**Authorization:** Analyst, Admin

**Query Parameters:** Same as CSV export

**Example:**

```bash
curl -X GET "http://localhost:5000/api/records/export/json?type=income" \
  -H "Authorization: Bearer <token>" \
  --output financial-records.json
```

**Response (200):**

```json
{
  "message": "Financial records exported successfully",
  "exportDate": "2024-01-15T10:30:00Z",
  "totalRecords": 25,
  "data": [
    {
      "transactionId": "TXN001",
      "type": "income",
      "category": "Salary",
      "amount": 5000,
      "currency": "USD",
      "description": "Monthly salary",
      "date": "2024-01-15T00:00:00Z",
      "status": "completed",
      "tags": ["salary", "monthly"],
      "createdBy": {
        "id": "609c1ff0e9c3b4a1f0c1e1b2",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Statistics & Analytics

### Get Record Statistics

**Endpoint:** `GET /api/records/stats/overview`

**Authorization:** Analyst, Admin

**Query Parameters:**

- `type` (optional)
- `status` (optional)
- `category` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `minAmount` (optional)
- `maxAmount` (optional)

**Example:**

```bash
curl -X GET "http://localhost:5000/api/records/stats/overview?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**

```json
{
  "message": "Record statistics retrieved successfully",
  "data": {
    "totalRecords": 150,
    "totalIncome": 50000,
    "totalExpense": 20000,
    "totalTransfer": 5000,
    "totalAmount": 75000,
    "averageTransaction": 500,
    "byType": {
      "income": 25,
      "expense": 100,
      "transfer": 25
    },
    "byStatus": {
      "pending": 10,
      "completed": 135,
      "failed": 5
    },
    "byCategory": {
      "Salary": 50000,
      "Groceries": 2500,
      "Utilities": 1200,
      "Entertainment": 1500,
      "Transport": 800,
      "Bonus": 3000
    }
  }
}
```

---

### Find Duplicate Records

**Endpoint:** `GET /api/records/stats/duplicates`

**Authorization:** Admin only

**Response (200):**

```json
{
  "message": "Duplicate records found",
  "data": {
    "duplicateGroups": 2,
    "details": [
      {
        "_id": "TXN001",
        "count": 2,
        "records": [
          {
            "_id": "609c1ff0e9c3b4a1f0c1e1c1",
            "transactionId": "TXN001",
            "type": "income",
            "amount": 5000,
            ...
          },
          {
            "_id": "609c1ff0e9c3b4a1f0c1e1c2",
            "transactionId": "TXN001",
            "type": "income",
            "amount": 5000,
            ...
          }
        ]
      }
    ]
  }
}
```

---

### Get Available Categories

**Endpoint:** `GET /api/records/data/categories`

**Authorization:** Analyst, Admin

**Response (200):**

```json
{
  "message": "Categories retrieved successfully",
  "data": {
    "totalCategories": 15,
    "categories": [
      "Bonus",
      "Entertainment",
      "Food",
      "Groceries",
      "Salary",
      "Transport",
      "Utilities",
      ...
    ]
  }
}
```

---

### Get Available Tags

**Endpoint:** `GET /api/records/data/tags`

**Authorization:** Analyst, Admin

**Response (200):**

```json
{
  "message": "Tags retrieved successfully",
  "data": {
    "totalTags": 8,
    "tags": [
      "bonus",
      "monthly",
      "recurring",
      "salary",
      "urgent",
      "vacation",
      "work",
      "weekly"
    ]
  }
}
```

---

## Updated Feature Matrix

| Feature                 | Viewer | Analyst | Admin |
| ----------------------- | ------ | ------- | ----- |
| View Records            | ✗      | ✓       | ✓     |
| View Record Details     | ✗      | ✓       | ✓     |
| Create Record           | ✗      | ✓       | ✓     |
| Update Record           | ✗      | ✓       | ✓     |
| Delete Record           | ✗      | ✗       | ✓     |
| Advanced Search         | ✗      | ✓       | ✓     |
| Create Multiple Records | ✗      | ✓       | ✓     |
| Delete Multiple Records | ✗      | ✗       | ✓     |
| Export as CSV           | ✗      | ✓       | ✓     |
| Export as JSON          | ✗      | ✓       | ✓     |
| View Statistics         | ✗      | ✓       | ✓     |
| Find Duplicates         | ✗      | ✗       | ✓     |
| View Categories         | ✗      | ✓       | ✓     |
| View Tags               | ✗      | ✓       | ✓     |

---

## Usage Examples

### Example 1: Complete Monthly Reconciliation

```bash
# 1. Search for all completed transactions in January
curl -X GET "http://localhost:5000/api/records/search/advanced?startDate=2024-01-01&endDate=2024-01-31&status=completed" \
  -H "Authorization: Bearer <token>"

# 2. Export to CSV for accounting
curl -X GET "http://localhost:5000/api/records/export/csv?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>" \
  --output january-records.csv

# 3. Get statistics for the month
curl -X GET "http://localhost:5000/api/records/stats/overview?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Example 2: Budget Analysis

```bash
# Find all grocery expenses over $50
curl -X GET "http://localhost:5000/api/records/search/advanced?type=expense&category=Groceries&minAmount=50&sortBy=amount-desc" \
  -H "Authorization: Bearer <token>"
```

### Example 3: Data Migration/Backup

```bash
# Export all records as JSON
curl -X GET "http://localhost:5000/api/records/export/json" \
  -H "Authorization: Bearer <token>" \
  --output backup-all-records.json
```

### Example 4: Bulk Import

```bash
# Create records in bulk from batch import
curl -X POST "http://localhost:5000/api/records/bulk/create" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @bulk-records.json
```

---

## Error Handling

All endpoints follow consistent error handling:

**400 Bad Request** - Validation errors or invalid input:

```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be a positive number"
    }
  ]
}
```

**401 Unauthorized** - Missing or invalid authentication token:

```json
{
  "message": "Unauthorized: Invalid token"
}
```

**403 Forbidden** - Insufficient permissions for the operation:

```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

**404 Not Found** - Resource not found:

```json
{
  "message": "Record not found"
}
```

**500 Internal Server Error** - Server-side error:

```json
{
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## Performance Tips

1. **Use Pagination:** Always use `page` and `limit` for large result sets
2. **Filter Before Export:** Apply filters to reduce export size
3. **Use Advanced Search:** More efficient than loading all records
4. **Batch Operations:** Use bulk create/delete for multiple operations
5. **Archive Old Records:** Regularly export and archive old data

---

## Best Practices

✅ **Do:**

- Use unique transaction IDs for each record
- Tag records for better organization
- Use date filters in searches
- Export data regularly for backup
- Monitor duplicate records

❌ **Don't:**

- Leave records with "pending" status indefinitely
- Create records without descriptions
- Use vague category names
- Ignore duplicate detection warnings
