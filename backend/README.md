# Finance Dashboard Backend

A backend API for a finance dashboard system with role-based access control (RBAC). It supports user management, financial records, analytics, and secure JWT authentication.

## Live Backend Link

If this backend is deployed for company use, set the production URL here:

```text
https://your-company-backend.example.com
```

> Replace the placeholder above with your actual company backend URL before sharing or pushing the repo.

## Key Features

- JWT authentication with password hashing
- Role-based access control: Viewer, Analyst, Admin
- User registration, login, and status management
- CRUD operations for financial records
- Analytics endpoints for summary, category breakdown, trends, and dashboard overview
- MongoDB database with Mongoose validation and indexing
- Input validation with `express-validator`
- Health monitoring endpoint

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- express-validator for validation
- morgan for request logging
- nodemon for development

## Repository Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── recordControllerEnhanced.js
│   │   ├── roleController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   └── checkPermission.js
│   ├── models/
│   │   ├── FinancialRecord.js
│   │   ├── Role.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── recordRoutesEnhanced.js
│   │   ├── roleRoutes.js
│   │   └── userRoutes.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── API_DOCUMENTATION.md
├── API_TESTING_GUIDE.md
├── TESTING_GUIDE.md
└── README.md
```

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file:

```bash
cp .env.example .env
```

Update `.env` with your MongoDB and JWT settings.

### 3. Run the backend

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

## Environment Variables

Use these variables in `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## GitHub Preparation

Before pushing to GitHub:

- Keep `.env` out of the repository
- Keep `node_modules/` out of the repository
- Remove temporary or local-only files
- Add a real live backend URL after deployment

Example Git commands:

```bash
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/your-company/backend-repo.git
git push -u origin main
```

## Important Endpoints

### Health

```bash
GET /api/health
```

### Roles

```bash
POST /api/roles/init
GET /api/roles
```

### Authentication

```bash
POST /api/auth/register
POST /api/auth/login
```

### Users (Admin only)

```bash
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
PATCH /api/users/:id/status
```

### Financial Records

```bash
GET /api/records
GET /api/records/:id
POST /api/records
PUT /api/records/:id
DELETE /api/records/:id
GET /api/records/user/:userId
```

### Analytics

```bash
GET /api/analytics/summary
GET /api/analytics/category-breakdown
GET /api/analytics/monthly-trends
GET /api/analytics/transaction-status
GET /api/analytics/dashboard-overview
```

## Quick Testing Examples

Initialize default roles:

```bash
curl -X POST http://localhost:5000/api/roles/init
```

Register a user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"Viewer"}'
```

Login and get a token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

Use the token:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/users
```

## Notes

- Do not commit `.env` or `node_modules/`
- Replace the live backend placeholder with your company deployment URL
- Use `API_DOCUMENTATION.md` for full endpoint references
