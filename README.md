# Node.js Backend Project

A Node.js + Express backend API for user authentication, courses, reviews, file uploads, and role-based access control.

## Features

- User register and login
- JWT authentication using access token and refresh token
- Cookies support for tokens
- Role-based authorization:
  - STUDENT
  - INSTRUCTOR
  - ADMIN
- Admin-only and instructor-only protected routes
- Course CRUD operations
- Course cover image upload
- Reviews system
- Forgot password and reset password using email
- Security middleware:
  - Helmet
  - Rate limit
  - CORS
  - HPP
  - Mongo sanitize
- Logging with Morgan and Winston
- Default admin account using seed script

---

## Requirements

Before running the project, make sure you have installed:

- Node.js
- npm
- MongoDB connection string
- Gmail account with App Password if you want to use forget/reset password email

---

## Installation

Install project dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root folder of the project.

You can copy the values from `.env.example` and replace them with your own values.

Example:

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

NODE_ENV=development

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

Important:

Do not upload your real `.env` file to GitHub.

Make sure `.gitignore` contains:

```gitignore
node_modules
.env
logs
uploads
```

---

## Create Default Admin Account

Register route only creates STUDENT accounts.

To create one admin account, run the admin seed script:

```bash
node utils/seedAdmin.js
```

This script should create or update the admin account based on the admin data in `.env`.

After running the script, you can login using:

```json
{
  "email": "admin@example.com",
  "password": "Admin@123456"
}
```

Use your actual admin email and password from `.env`.

---

## Run the Project

For development:

```bash
npm run dev
```

Or:

```bash
node index.js
```

The server will run on:

```txt
http://localhost:3000
```

Unless you changed the `PORT` value in `.env`.

---

## Authentication

After login, the API creates:

- Access token
- Refresh token

Tokens can be sent using cookies or Authorization header.

Example Authorization header:

```txt
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Main API Routes

### Auth Routes

```http
POST /api/register
POST /api/login
POST /api/logout
POST /api/refresh-token
POST /api/forget-password
PATCH /api/reset-password/:token
```

---

### User Routes

```http
GET /api/users
PATCH /api/update-profile
```

Some routes require authentication and admin permission.

---

### Course Routes

```http
GET /api/courses
GET /api/courses/:id
POST /api/courses
PUT /api/courses/:id
DELETE /api/courses/:id
POST /api/courses/:id/upload-cover
```

Course create, update, delete, and upload cover routes require ADMIN or INSTRUCTOR role.

---

### Review Routes

```http
POST /api/courses/:courseId/reviews
GET /api/courses/:courseId/reviews
PATCH /api/reviews/:reviewId
DELETE /api/reviews/:reviewId
```

Adding a review requires a logged-in STUDENT account.

---

## Course Search, Filter, and Sort

You can search, filter, and sort courses using query parameters.

### Get all courses

```http
GET /api/courses
```

### Search by name or description

```http
GET /api/courses?search=javascript
```

### Filter by price

```http
GET /api/courses?minPrice=1000
```

```http
GET /api/courses?maxPrice=5000
```

```http
GET /api/courses?minPrice=1000&maxPrice=5000
```

### Sort courses

Sort by price ascending:

```http
GET /api/courses?sort=price
```

Sort by price descending:

```http
GET /api/courses?sort=-price
```

Sort by name:

```http
GET /api/courses?sort=name
```

### Search + Filter + Sort

```http
GET /api/courses?search=js&minPrice=1000&maxPrice=5000&sort=price
```

---

## File Upload

For image upload, use Postman:

```txt
Body -> form-data
```

The file field name must match the backend multer field name.

For example:

```txt
avatar: File
```

---

## Forgot Password

To request a reset password link:

```http
POST /api/forget-password
```

Body:

```json
{
  "email": "user@example.com"
}
```

To reset the password:

```http
PATCH /api/reset-password/:token
```

Body:

```json
{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

For Gmail email sending, use a Gmail App Password, not your normal Gmail password.

---

## Logging

The project can use:

- Morgan for request logging in development
- Winston for saving errors in log files

Logs should not be uploaded to GitHub.

Add this to `.gitignore`:

```gitignore
logs
```

---

## Security Notes

Before submitting or deploying the project:

1. Do not upload `.env` to GitHub.
2. Change all JWT secrets.
3. Change MongoDB password if it was exposed.
4. Use Gmail App Password for email sending.
5. Keep register route creating STUDENT only.
6. Create ADMIN only using the seed script.
7. Protect admin routes using authentication and role authorization.

---

## Project Startup Steps for a New Developer

1. Clone or download the project.
2. Run:

```bash
npm install
```

3. Create `.env` file using `.env.example`.
4. Add MongoDB URI and JWT secrets.
5. Add admin credentials in `.env`.
6. Run:

```bash
node utils/seedAdmin.js
```

7. Start the server:

```bash
npm run dev
```

8. Login using the admin account.
9. Test protected routes using Postman.

---

## Notes

- Register creates STUDENT accounts only.
- ADMIN account should be created using `seedAdmin.js`.
- Do not allow users to send role in register body.
- Use `verifyToken` before protected routes.
- Use `allowedto(...)` for role-based permissions.
