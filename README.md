# UrbanReports — Map-First Civic Issue Reporting Platform

UrbanReports is a modern, map-first civic issue reporting platform engineered for transparent infrastructure tracking, pothole reporting, streetlight fixes, garbage cleanup, and municipal department dispatching.

---

## 🏗️ Architecture Overview

```
                                  URBANREPORTS MONOREPO
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         ▼                                   ▼                                   ▼
    apps/web                          services/users                     services/complaints
 (Next.js 15 + MUI)                (NestJS + MongoDB Atlas)             (NestJS + Neon PostGIS)
```

- **Phase 1**: Frontend Foundation (Warm off-white visual identity, MapLibre GL JS, MUI, GSAP motion, floating bottom navigation dock).
- **Phase 2**: Users & Authentication Microservice (`services/users` with NestJS, MongoDB Atlas, JWT authentication, Bcrypt password hashing, local Aadhaar format validation, and profile settings persistence).
- **Phase 3**: Complaints Core Microservice (`services/complaints` with NestJS, Neon PostgreSQL, PostGIS Point `location` SRID 4326, GiST spatial index, transactional status lifecycle, status history auditing, nearby/viewport spatial endpoints, and seed data).

---

## 🔑 Key Features (Phase 1 + Phase 2 + Phase 3)

- **Map-First Experience**: Interactive MapLibre GL canvas with custom monochrome markers, popups, and PostGIS viewport bounds filtering.
- **Floating Bottom Navigation Dock**: Floating command dock (`FloatingBottomNav`) providing seamless navigation across Home, Map, Report, Catalog Feed, Profile, and Admin routes.
- **Users Microservice**: NestJS + MongoDB Atlas backend with JWT authentication, role-based authorization (`CITIZEN`, `OFFICER`, `AUTHORITY`, `ADMIN`), and notification preference storage.
- **Complaints Microservice**: NestJS + Neon PostgreSQL + PostGIS backend for authoritative civic issue storage, transactional status history auditing, and PostGIS distance (`ST_DWithin`) / viewport (`ST_MakeEnvelope`) queries.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Material UI (MUI), GSAP, MapLibre GL JS, Tailwind CSS.
- **Users Service**: NestJS 10, Mongoose, MongoDB Atlas, Passport JWT, Bcrypt, Class-Validator.
- **Complaints Service**: NestJS 10, Neon PostgreSQL, PostGIS Extension, `pg` Pool, Class-Validator.
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

# Terminal 2: Complaints Service (Port 3002)
pnpm --filter @urbanreports/complaints start:dev

# Terminal 3: Web App (Port 3000)
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

### `services/complaints/.env`
```env
PORT=3002
NEON_DATABASE_URL=postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
USERS_SERVICE_URL=http://localhost:3001
```

### `apps/web/.env.local`
```env
NEXT_PUBLIC_USERS_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_COMPLAINTS_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_MAPTILER_API_KEY=
```

---

## 📜 Git Commit Progression

```bash
b1b5654 updated Phase 2 documentation and configuration
2c3edf8 implemented logout and polished authentication flow
8e13415 connected profile and notification settings
f80fbb0 implemented login and JWT authentication
ff69cb3 added user registration and password hashing
b9d67a7 connected MongoDB Atlas to users service
86e7549 created NestJS users service
```
