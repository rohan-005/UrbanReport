# UrbanReports Complaints Microservice (`services/complaints`)

The **Complaints Service** is an authoritative NestJS microservice that manages civic complaint dossiers, geospatial indexing, status lifecycle transitions, and audit trails.

## 🏗️ Architecture & Technology Stack

- **Framework**: NestJS 10 (TypeScript)
- **Database Engine**: Neon PostgreSQL + PostGIS Extension (`geometry(Point, 4326)`)
- **Spatial Index**: GiST Index on PostGIS Point `location`
- **Authentication**: Passport JWT Strategy (`JwtStrategy`, `JwtAuthGuard`)
- **Validation**: `class-validator`, `class-transformer`

---

## 🗺️ Database Tables & PostGIS Schemas

1. **`complaints`**: `id` (UUID), `reporter_user_id` (External reference to `services/users`), `category`, `title`, `description`, `severity`, `status`, `location` (`GEOMETRY(Point, 4326)`), `address`, `upvotes_count`, `created_at`, `updated_at`.
2. **`status_history`**: `id`, `complaint_id`, `from_status`, `to_status`, `actor_user_id`, `note`, `created_at`.
3. **`departments`**: `id`, `name`, `service_area`, `active`, `created_at`.
4. **`assignments`**: `id`, `complaint_id`, `department_id`, `officer_id`, `notes`, `assigned_at`.
5. **`complaint_media`**: `id`, `complaint_id`, `media_id` (Reference for Phase 4 Media service), `type`, `url`, `created_at`.
6. **`complaint_confirmations`**: `complaint_id`, `user_id`, `created_at` (Phase 8 community validation hook).
7. **`audit_events`**: `id`, `actor_id`, `action`, `resource`, `resource_id`, `metadata` (`JSONB`), `created_at`.

---

## 🔄 State Machine & Status Lifecycle Matrix

The `ComplaintLifecycleService` enforces transactional status updates:

```
SUBMITTED ──► UNDER_REVIEW ──► VERIFIED ──► ASSIGNED ──► IN_PROGRESS ──► RESOLVED
    │               │            │             │              │             │
    ├──► REJECTED   ├──► REJECTED├──► REJECTED ├──► REJECTED  └──► REOPENED └──► REOPENED
```

Every valid status transition executes inside a single database transaction:
1. Validates allowed state transition.
2. Updates `status` and `updated_at` in `complaints`.
3. Inserts an immutable trail entry into `status_history`.
4. Records an audit entry in `audit_events`.

---

## 🌐 API Endpoints

### Core Complaints & Listing
- `POST /complaints`: Create complaint with category, title, description, severity, address, latitude, longitude (Derived `reporter_user_id` from JWT context).
- `GET /complaints`: List complaints with pagination (`page`, `limit`), sorting (`newest`, `oldest`, `upvotes`, `severity`), and filters (`category`, `severity`, `status`, `search`).
- `GET /complaints/me`: Retrieve complaints submitted by the authenticated citizen.
- `GET /complaints/:id`: Retrieve complaint dossier by UUID with complete `statusHistory`.
- `PATCH /complaints/:id/status`: Transactional status update (`nextStatus`, `note`).

### Geospatial Queries (PostGIS)
- `GET /complaints/nearby?lat=28.6139&lng=77.2090&radius=5000`: Radius search in meters using PostGIS `ST_DWithin`.
- `GET /complaints/viewport?minLat=...&minLng=...&maxLat=...&maxLng=...`: Bounding box viewport query using PostGIS `ST_MakeEnvelope`.

### System Health
- `GET /health`: Health check status for container orchestration and Render deployment.

---

## 🚀 Local Development Setup

Copy `.env.example` to `.env`:

```env
PORT=3002
NEON_DATABASE_URL=postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
USERS_SERVICE_URL=http://localhost:3001
```

### Running Service

```bash
# Start development server
pnpm --filter @urbanreports/complaints start:dev

# Seed database with municipal departments and 20+ complaints
npx ts-node services/complaints/src/database/seed.ts
```
