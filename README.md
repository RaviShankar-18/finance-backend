# Finance Backend API

A RESTful backend API for a finance dashboard system with role-based access control, financial record management, and analytics features.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Role-Based Access Control](#role-based-access-control)
- [Assumptions](#assumptions)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

This backend provides APIs for:
- **User Management** → User registration, login, role assignment
- **Financial Records** → Create, read, update, delete financial transactions
- **Dashboard Analytics** → Summaries, category-wise analysis, trends
- **Access Control** → Role-based permissions (Admin, Analyst, Viewer)

The system is designed to be clean, maintainable, and follows first-principles thinking with clear separation of concerns.

---

## 🛠️ Tech Stack

- **Framework**: Node.js + Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

---

## 📁 Project Structure

```
finance-backend/
│
├── db/
│   └── db.connect.js                 → MongoDB connection setup
│
├── models/
│   ├── user.model.js                 → User schema (name, email, password, role, isActive)
│   └── financialRecord.model.js      → Financial record schema (amount, type, category, date)
│
├── middleware/
│   ├── auth.middleware.js            → JWT verification
│   └── role.middleware.js            → Role-based authorization
│
├── routes/
│   ├── auth.routes.js                → Register & Login
│   ├── record.routes.js              → CRUD operations for records
│   ├── dashboard.routes.js           → Analytics & summaries
│   └── user.routes.js                → User management (admin only)
│
├── utils/
│   └── validators.js                 → Input validation helpers
│
├── .env                              → Environment variables
├── index.js                          → Express app entry point
├── package.json                      → Dependencies
└── README.md                         → This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Step 1: Clone or Download Project
```bash
cd finance-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment Variables
Create a `.env` file in root directory:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/financeDB
JWT_SECRET=your_secret_key_here
PORT=3000
```

### Step 4: Start Server
```bash
npm start
# or for development with auto-reload:
nodemon index.js
```

Expected Output:
```
Server is running at port no. 3000
Connected to database successfully.
```

### Step 5: Test API
Use Thunder Client, Postman, or curl to test endpoints.

---

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/financeDB` |
| `JWT_SECRET` | Secret key for JWT signing | `finance_secret_2024` |
| `PORT` | Server port | `3000` |

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

---

### 1. Authentication APIs

#### Register User
```
POST /auth/register

Body:
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "password123",
  "role": "viewer"  // optional, default: "viewer"
}

Response (201):
{
  "message": "User registered successfully.",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "viewer"
  }
}
```

#### Login User
```
POST /auth/login

Body:
{
  "email": "john@gmail.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful.",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "viewer"
  }
}

⚠️ Save the token → use in Authorization header for protected routes
```

---

### 2. Financial Records APIs

#### Create Record (Admin Only)
```
POST /records

Headers:
  authorization: your_token

Body:
{
  "amount": 5000,
  "type": "income",           // "income" or "expense"
  "category": "salary",
  "date": "2026-04-02",       // format: YYYY-MM-DD
  "description": "Monthly salary"
}

Response (201):
{
  "message": "Financial record created successfully.",
  "record": { ... }
}
```

#### Get All Records (All Logged-In Users)
```
GET /records

Headers:
  authorization: your_token

Query Parameters (optional):
  ?type=income
  ?category=salary
  ?date=2026-04-02

Response (200):
{
  "message": "Records fetched successfully.",
  "total": 5,
  "records": [ ... ]
}
```

#### Get Single Record
```
GET /records/:recordId

Headers:
  authorization: your_token

Response (200):
{
  "message": "Record fetched successfully.",
  "record": { ... }
}
```

#### Update Record (Admin Only)
```
PUT /records/:recordId

Headers:
  authorization: your_token

Body:
{
  "amount": 6000,
  "category": "bonus"
}

Response (200):
{
  "message": "Record updated successfully.",
  "record": { ... }
}
```

#### Delete Record (Admin Only)
```
DELETE /records/:recordId

Headers:
  authorization: your_token

Response (200):
{
  "message": "Record deleted successfully.",
  "record": { ... }
}
```

---

### 3. Dashboard APIs (Admin & Analyst Only)

#### Get Summary
```
GET /dashboard/summary

Headers:
  authorization: your_token

Response (200):
{
  "message": "Summary fetched successfully.",
  "data": {
    "totalIncome": 55000,
    "totalExpense": 6500,
    "netBalance": 48500
  }
}
```

#### Get Category-Wise Totals
```
GET /dashboard/category-wise

Headers:
  authorization: your_token

Response (200):
{
  "message": "Category wise data fetched successfully.",
  "data": [
    { "_id": "salary", "total": 50000, "count": 1 },
    { "_id": "food", "total": 5000, "count": 2 }
  ]
}
```

#### Get Recent Transactions
```
GET /dashboard/recent

Headers:
  authorization: your_token

Response (200):
{
  "message": "Recent transactions fetched successfully.",
  "data": [ ... ]  // last 5 records
}
```

#### Get Monthly Trends
```
GET /dashboard/monthly-trends

Headers:
  authorization: your_token

Response (200):
{
  "message": "Monthly trends fetched successfully.",
  "data": [
    {
      "_id": { "year": 2026, "month": 4, "type": "income" },
      "total": 50000
    }
  ]
}
```

---

### 4. User Management APIs (Admin Only)

#### Get All Users
```
GET /users

Headers:
  authorization: admin_token

Response (200):
{
  "message": "Users fetched successfully.",
  "total": 2,
  "users": [ ... ]
}
```

#### Get Single User
```
GET /users/:userId

Headers:
  authorization: admin_token

Response (200):
{
  "message": "User fetched successfully.",
  "user": { ... }
}
```

#### Update User Role
```
PATCH /users/:userId/role

Headers:
  authorization: admin_token

Body:
{
  "role": "analyst"  // admin, analyst, or viewer
}

Response (200):
{
  "message": "User role updated successfully.",
  "user": { ... }
}
```

#### Deactivate/Activate User
```
PATCH /users/:userId/status

Headers:
  authorization: admin_token

Body:
{
  "isActive": false  // true to activate, false to deactivate
}

Response (200):
{
  "message": "User deactivated successfully.",
  "user": { ... }
}

⚠️ Deactivated users cannot login
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (admin | analyst | viewer, default: viewer),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Financial Record Model
```javascript
{
  _id: ObjectId,
  amount: Number (required, positive),
  type: String (income | expense, required),
  category: String (required),
  date: Date (required),
  description: String (optional),
  createdBy: ObjectId (references User),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🔐 Role-Based Access Control

| Feature | Admin | Analyst | Viewer |
|---------|-------|---------|--------|
| Create Records | ✅ | ❌ | ❌ |
| View Records | ✅ | ✅ | ✅ |
| Update Records | ✅ | ❌ | ❌ |
| Delete Records | ✅ | ❌ | ❌ |
| View Dashboard | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 💡 Assumptions

1. **MongoDB Atlas Used** → Can be replaced with local MongoDB by updating connection string
2. **No Real Transactions** → This is a dashboard system, not a banking system with real money transfers. No ACID transaction rollback needed
3. **JWT Expiry** → Tokens expire in 24 hours. No refresh token mechanism implemented
4. **Single Admin** → At least one admin must exist in system
5. **Soft Delete Not Implemented** → Records are permanently deleted. Can be added later
6. **No Pagination** → All records returned at once. Can add pagination with limit/skip
7. **Email Validation** → Basic regex validation. Strong validation can be added
8. **Password Requirements** → Minimum 6 characters. Can enforce stronger rules (uppercase, numbers, etc.)

---

## 🚀 Future Enhancements

- [ ] Pagination for record listings
- [ ] Search functionality for records
- [ ] Soft delete (archive records instead of deleting)
- [ ] Refresh token mechanism
- [ ] Two-factor authentication
- [ ] Email verification on registration
- [ ] Rate limiting on APIs
- [ ] Unit & integration tests
- [ ] API request logging
- [ ] Data export (CSV/PDF)
- [ ] Scheduled reports
- [ ] Budget alerts

---

## 🧪 Testing

### Test Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@gmail.com","password":"test123"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"test123"}'
```

### Test Protected Route
```bash
curl -X GET http://localhost:3000/api/records \
  -H "authorization: your_token_here"
```

---

## 📝 Notes

- All passwords are hashed using bcryptjs before storage
- JWTs are signed with JWT_SECRET from .env
- Tokens are sent in Authorization header for protected routes
- All timestamps are in UTC
- MongoDB ObjectIds are automatically generated

---

## 👨‍💻 Author

Built with focus on clean code, first-principles thinking, and maintainability.

---

## 📄 License

This project is for educational purposes.
```



