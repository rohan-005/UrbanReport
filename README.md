# UrbanReports — Map-First Civic Issue Reporting Platform

UrbanReports is a modern, map-first civic issue reporting platform engineered for transparent infrastructure tracking, pothole reporting, streetlight fixes, garbage cleanup, and municipal department dispatching.

---

## 🏗️ Architecture Overview

```
                      URBANREPORTS MONOREPO
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
    apps/web                                      services/users
 (Next.js 15 + MUI)                            (NestJS + MongoDB Atlas)
```

- **Phase 1**: Frontend Foundation (Warm off-white visual identity, MapLibre GL JS, MUI, GSAP motion, floating bottom navigation dock).
- **Phase 2**: Users & Authentication Microservice (`services/users` with NestJS, MongoDB Atlas, JWT authentication, Bcrypt password hashing, local Aadhaar format validation, and profile settings persistence).

---

## 🔑 Key Features (Phase 1 + Phase 2)

- **Map-First Experience**: Interactive MapLibre GL canvas with custom monochrome markers, popups, and category layer filters.
- **Floating Bottom Navigation Dock**: Compact floating command dock anchored near the viewport bottom (`FloatingBottomNav`), providing seamless navigation across Home, Map, Report, Catalog Feed, Profile, and Admin routes.
- **Production Users Microservice**: NestJS backend service with MongoDB Atlas connection, registration, login, JWT bearer strategy, role-based authorization (`CITIZEN`, `OFFICER`, `AUTHORITY`, `ADMIN`), and `/health` monitoring.
- **Local Aadhaar Privacy**: 12-digit format pattern validation storing only masked values (`XXXX-XXXX-1234`).
- **Notification Settings**: Persistent preferences (`complaintUpdates`, `resolutionNotifications`, `assignmentUpdates`) stored in MongoDB user documents.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Material UI (MUI), GSAP, MapLibre GL JS, Tailwind CSS.
- **Users Service**: NestJS 10, Mongoose, MongoDB Atlas, Passport JWT, Bcrypt, Class-Validator.
- **Monorepo Engine**: pnpm workspaces, Turbo.

---

## 💻 Local Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Build workspace
pnpm build

# 3. Start development servers
# Terminal 1: Users Service (Port 3001)
pnpm --filter @urbanreports/users start:dev

# Terminal 2: Web App (Port 3000)
pnpm --filter @urbanreports/web dev
```

---

## 📝 Environment Variables

### `services/users/.env`
```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority
DB_NAME=urbanreports_users
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
```

### `apps/web/.env.local`
```env
NEXT_PUBLIC_USERS_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_MAPTILER_API_KEY=
```

---

## 📜 Git Commit Progression

```bash
2c3edf8 implemented logout and polished authentication flow
8e13415 connected profile and notification settings
f80fbb0 implemented login and JWT authentication
ff69cb3 added user registration and password hashing
b9d67a7 connected MongoDB Atlas to users service
86e7549 created NestJS users service
6836955 refined floating bottom navigation and component styling
f4eab60 used off white as the main page background
36d4d55 ui changes - phase 1
18153f9 structure cleanup
8bd9079 removed build cache artifacts and updated gitignore
bc4d3fd completed Phase 1 frontend validation and documentation
225b209 fixed responsive layout and polished frontend states
0019f30 implemented admin complaint dashboard and actions
bfdf1dc added login registration and citizen profile screens
9476223 implemented report issue form and submission flow
ea0b264 implemented complaint list details and timeline
6159410 added interactive civic issue map and markers
c9d8961 added complaint types mock data and repository
a39ba44 implemented UrbanReports layout and navigation
d4be3ee initialized UrbanReports project structure
```
