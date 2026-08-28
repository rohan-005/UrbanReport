# UrbanReports Users Microservice (`services/users`)

The **Users Service** is a NestJS microservice responsible for user identity management, authentication, role-based access control, profile updates, and notification preference storage.

> [!NOTE]
> The MongoDB user database starts completely empty (0 users). All citizen profiles are created via public registration (`POST /auth/register`). No default hardcoded credentials exist.

## 🏗️ Architecture

- **Framework**: NestJS 10 (TypeScript)
- **Database**: MongoDB Atlas (`@nestjs/mongoose`, `mongoose`)
- **Authentication**: Passport JWT (`@nestjs/passport`, `@nestjs/jwt`)
- **Password Hashing**: Bcrypt (`bcrypt`, 10 rounds)
- **Validation**: `class-validator`, `class-transformer`

---

## 🔑 Security & Aadhaar Policy

1. **Password Protection**: Plaintext passwords are never stored, logged, or returned in API responses.
2. **Aadhaar Privacy**: Only masked Aadhaar representations (`XXXX-XXXX-1234`) are persisted. Local 12-digit format pattern checks are enforced without UIDAI integration.
3. **Role Control**: Public registration strictly defaults to the `CITIZEN` role. Privileged roles (`OFFICER`, `AUTHORITY`, `ADMIN`) cannot be self-assigned in public registration.
4. **Account Enumeration Defense**: Invalid login attempts return generic authentication errors ("Invalid email address or password").

---

## 🌐 API Endpoints

### Health & Monitoring
- `GET /health`: Health check status for container orchestration and Render deployment.

### Authentication
- `POST /auth/register`: Create user account with name, email, phone, password, and Aadhaar format check.
- `POST /auth/login`: Authenticate email/password and issue JWT access token.
- `POST /auth/logout`: Logout endpoint.

### Profile & Settings (Authenticated - `Bearer <token>`)
- `GET /users/me`: Return authenticated user profile.
- `PATCH /users/me`: Update name, phone, or avatar.
- `GET /users/me/notification-preferences`: Retrieve notification settings.
- `PATCH /users/me/notification-preferences`: Persist notification settings (`complaintUpdates`, `resolutionNotifications`, `assignmentUpdates`).

---

## 🚀 Environment Setup

Copy `.env.example` to `.env`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority
DB_NAME=urbanreports_users
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
```

### Running Service Locally

```bash
# From workspace root
pnpm --filter @urbanreports/users start:dev
```
