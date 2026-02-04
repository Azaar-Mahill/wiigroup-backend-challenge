# Provider Registration API

A RESTful API for service provider registration, document upload, and admin verification. Built with **Node.js**, **Express**, and **PostgreSQL**.

---

## Tech Stack

| Layer        | Technology                |
|--------------|---------------------------|
| Runtime      | Node.js (v18+)            |
| Framework    | Express.js                |
| Database     | PostgreSQL (v14+)         |
| Auth         | JWT (jsonwebtoken)        |
| File Upload  | Multer                    |
| Validation   | express-validator         |
| Password     | bcryptjs                  |

---

## Prerequisites

- Node.js v18 or later
- PostgreSQL v14 or later
- npm

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable       | Description                          | Default         |
|----------------|--------------------------------------|-----------------|
| PORT           | Server port                          | 3000            |
| NODE_ENV       | Environment                          | development     |
| DB_HOST        | PostgreSQL host                      | localhost       |
| DB_PORT        | PostgreSQL port                      | 5432            |
| DB_NAME        | Database name                        | wii_providers   |
| DB_USER        | Database user                        | —               |
| DB_PASSWORD    | Database password                    | —               |
| JWT_SECRET     | Secret for signing JWTs              | —               |
| ADMIN_PASSWORD | Password for the seeded admin user   | admin123        |

### 3. Create the Database

Connect to PostgreSQL and run:

```sql
CREATE DATABASE wii_providers;
```

### 4. Run Migrations

Creates the `providers` and `admins` tables:

```bash
npm run migrate
```

### 5. Seed Admin User

Creates the default admin account used to login and verify providers:

```bash
npm run seed
```

Output will confirm the username and password.

### 6. Start the Server

```bash
# Development (auto-reloads on file changes)
npm run dev

# Production
npm start
```

The API is available at `http://localhost:3000`.

---

## API Endpoints

### Health Check

| Method | Endpoint     | Auth | Description        |
|--------|--------------|------|--------------------|
| GET    | `/api/health`| No   | Server health check |

---

### Authentication

#### `POST /api/auth/login`

Authenticates an admin and returns a JWT token.

**Body (`application/json`):**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success (200):**

```json
{
  "message": "Login successful",
  "token": "<jwt_token>",
  "admin": { "id": "...", "username": "admin" }
}
```

---

### Providers

#### `POST /api/providers/register`

Registers a new service provider. Accepts `multipart/form-data`.

| Field         | Type   | Required | Constraints                        |
|---------------|--------|----------|------------------------------------|
| name          | string | Yes      | 2–255 characters                   |
| email         | string | Yes      | Valid email, must be unique         |
| phone         | string | Yes      | Valid phone number (7–20 chars)    |
| business_type | string | Yes      | 2–100 characters                   |
| documents     | file   | No       | PDF/JPG/PNG/DOC/DOCX, max 5 MB    |

**Success (201):**

```json
{
  "id": "provider_a1b2c3d4",
  "status": "pending_verification",
  "message": "Registration successful. Awaiting verification."
}
```

---

#### `GET /api/providers/:id`

Returns provider details. Email and phone are masked for privacy.

**Success (200):**

```json
{
  "id": "provider_a1b2c3d4",
  "name": "ABC Provider",
  "email": "a***@example.com",
  "phone": "+94 77 *** **67",
  "business_type": "Service Operator",
  "status": "pending_verification",
  "verified_at": null,
  "verified_by": null,
  "created_at": "2026-01-21T10:00:00.000Z"
}
```

---

#### `PUT /api/providers/:id/verify`

Admin-only. Approves or rejects a provider. Requires a valid JWT in the `Authorization` header.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Body (`application/json`):**

```json
{
  "status": "approved",
  "notes": "Documents verified successfully"
}
```

| Field  | Type   | Required | Constraints                        |
|--------|--------|----------|------------------------------------|
| status | string | Yes      | `"approved"` or `"rejected"`       |
| notes  | string | No       | Max 500 characters                 |

**Success (200):**

```json
{
  "id": "provider_a1b2c3d4",
  "status": "approved",
  "verified_at": "2026-01-21T14:30:00.000Z",
  "verified_by": "admin"
}
```

---

## Error Response Format

All errors return a consistent structure:

```json
{
  "error": "Error Type",
  "message": "A human-readable description of what went wrong."
}
```

Validation errors include field-level detail:

```json
{
  "error": "Validation Error",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning                              |
|------|--------------------------------------|
| 201  | Resource created                     |
| 400  | Validation or bad request            |
| 401  | Missing or invalid JWT               |
| 404  | Provider not found                   |
| 409  | Email already registered             |
| 500  | Internal server error                |

---

## Data Masking Rules

| Field | Rule                                  | Example              |
|-------|---------------------------------------|----------------------|
| Email | First char + `***` + `@domain`        | `a***@example.com`   |
| Phone | Country + area + `*** **` + last 2    | `+94 77 *** **67`    |

---

## Project Structure

```
├── migrations/                 # Ordered SQL migration files
│   ├── 001_create_providers.sql
│   └── 002_create_admins.sql
├── postman/                    # Postman collection JSON
├── scripts/
│   ├── migrate.js              # Runs pending migrations
│   └── seed.js                 # Seeds the admin user
├── src/
│   ├── app.js                  # Express app setup and middleware
│   ├── server.js               # HTTP server entry point
│   ├── config/
│   │   └── database.js         # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # Admin login logic
│   │   └── providerController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   └── errorHandler.js     # 404 + global error handler
│   ├── routes/
│   │   ├── auth.js             # Auth route definitions
│   │   └── providers.js        # Provider routes + multer config
│   ├── utils/
│   │   └── maskData.js         # Email and phone masking
│   └── validators/
│       └── providerValidator.js
├── uploads/                    # Uploaded files (gitignored)
├── .env.example
├── .gitignore
└── package.json
```

---

## Design Decisions

1. **Provider ID format** — `provider_<8 hex chars>` (UUID-derived). Readable and unique without a sequential auto-increment dependency.
2. **Migration tracking** — A `migrations` table records which `.sql` files have been executed, preventing duplicate runs.
3. **Single admin seed** — One admin account is sufficient for this scope. The seed script is idempotent (safe to run multiple times).
4. **Local file storage** — Documents are saved to `uploads/`. In production this would be replaced with S3 or equivalent object storage.
5. **Re-verification guard** — A provider already approved or rejected cannot be verified again, preventing accidental status overwrites.
6. **Multer error handling** — File upload errors (wrong type, size limit) are caught before reaching the route handler and return clear 400 responses.

---

## Testing

Import the Postman collection from `postman/Provider_Registration_API.postman_collection.json`.

The collection auto-saves the admin token and provider ID between requests, so run them in order:

1. **Admin Login** → token is saved automatically
2. **Register Provider** → provider ID is saved automatically
3. **Get Provider** → uses the saved provider ID
4. **Verify Provider** → uses both saved values
