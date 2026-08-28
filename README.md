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

> [!IMPORTANT]
> **Production Empty-Database Architecture**: UrbanReports starts completely clean with 0 users and 0 complaints in database tables. All users register dynamically via `/register`, and all complaints are reported via `/report`. Optional development seed data can be populated on demand via `pnpm db:seed`.

---

## 🔑 Key Features

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

# 3. Start all backend microservices concurrently (Users, Complaints, Media)
pnpm dev:services

# Or start all services + web frontend at once
pnpm dev:all

# Alternatively start services individually in separate terminals:
# Terminal 1: Users Service (Port 3001)
pnpm --filter @urbanreports/users start:dev

# Terminal 2: Complaints Service (Port 3002)
pnpm --filter @urbanreports/complaints start:dev

# Terminal 3: Media Service (Port 3003)
pnpm --filter @urbanreports/media start:dev

# Terminal 4: Web App (Port 3000)
pnpm --filter @urbanreports/web dev

# Optional: Populate development seed complaints manually
pnpm db:seed
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
