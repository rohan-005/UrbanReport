# UrbanReports - Map-First Civic Issue Reporting Platform

UrbanReports is a modern, map-first civic tech infrastructure platform engineered for transparent municipal issue tracking, pothole reporting, streetlight fixes, garbage cleanup, water supply leak tracking, and departmental dispatching.

---

## Architecture Overview

```
                                  URBANREPORTS MONOREPO
                                             |
         +-----------------------------------+-----------------------------------+
         |                                   |                                   |
         v                                   v                                   v
    apps/web                            apps/gateway                       services/
 (Next.js 15 App Router)               (NestJS API Gateway)
         |                                   |
         +-----------------+-----------------+-----------------+-----------------+
                           |                 |                 |                 |
                           v                 v                 v                 v
                    services/users   services/complaints services/media   services/maps
                    (NestJS/MongoDB)  (NestJS/PostgreSQL) (NestJS/GridFS) (NestJS/MapTiler)
```

The system uses a microservices architecture coordinated by an API Gateway:

- **Frontend Client (`apps/web`)**: Next.js 15 App Router, React 19, Material UI (MUI), MapLibre GL JS, GSAP motion, and Tailwind CSS.
- **API Gateway (`apps/gateway`)**: NestJS Gateway proxying REST (`/api/*`) and GraphQL (`/graphql`) endpoints to microservices with request normalization, CORS, and unified error handling.
- **Users Service (`services/users`)**: NestJS microservice backed by MongoDB Atlas for user identity, authentication (JWT), password hashing (Bcrypt), role authorization (`CITIZEN`, `OFFICER`, `AUTHORITY`, `ADMIN`), and notification preferences.
- **Complaints Service (`services/complaints`)**: NestJS microservice backed by PostgreSQL and PostGIS for geospatial complaint storage, SRID 4326 geometry indexes, transactional status auditing (`status_history`), spatial proximity (`ST_DWithin`) and viewport queries (`ST_MakeEnvelope`).
- **Media Service (`services/media`)**: NestJS microservice backed by MongoDB GridFS for binary evidence image uploads, magic-number validation (JPEG, PNG, WEBP), size restrictions, SHA-256 checksum calculation, and stream delivery.
- **Maps Service (`services/maps`)**: NestJS microservice for reverse geocoding, place search, and spatial coordinates lookup via MapTiler and Nominatim integrations.

---

## Key Capabilities

- **Map-First Experience**: Interactive MapLibre GL JS map with custom markers, popups, and spatial bounds filtering.
- **Geospatial Reporting**: Auto-location detection via HTML5 Geolocation, interactive map location picker, and automated reverse geocoding for precise street addresses.
- **Media Evidence Upload**: Drag-and-drop image upload supporting JPEG, PNG, and WebP formats with server-side validation and checksum integrity verification.
- **Citizen Identity & Security**: JWT-based authentication with bcrypt password hashing and client-side Aadhaar 12-digit format validation.
- **Transparent Status Lifecycle**: Track complaint states (`SUBMITTED`, `IN_REVIEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`) with an immutable audit log of status history.
- **Floating Navigation Control Dock**: Prominent navigation control dock (`FloatingBottomNav`) providing access across Home, Map, Report, Complaint Feed, Profile, and Admin Management routes.
- **Resilient Fallback Storage**: Complaints Service includes in-memory fallback persistence ensuring application stability even during temporary database connectivity outages.

---

## Service Port Registry

- **Web Frontend**: `http://localhost:3000`
- **Users Microservice**: `http://localhost:3001`
- **Complaints Microservice**: `http://localhost:3002`
- **Media Microservice**: `http://localhost:3003`
- **Maps Microservice**: `http://localhost:3004`
- **API Gateway**: `http://localhost:3005` (REST at `/api/*`, GraphQL at `/graphql`)

---

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Material UI (MUI), MapLibre GL JS, GSAP, Tailwind CSS, Lucide Icons.
- **Backend & Gateway**: NestJS 10, Express, Mongoose, PostgreSQL (`pg`), PostGIS, Multer, GridFS, Passport JWT, Class-Validator, Class-Transformer.
- **Databases**: MongoDB (Users & Media Metadata / GridFS), PostgreSQL + PostGIS (Complaints & Spatial Indexing).
- **Monorepo & Build Tools**: pnpm Workspaces, Turbo, Vitest, Jest.

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# 1. Clone the repository and install dependencies
git clone https://github.com/urbanreports/urbanreports.git
cd UrbanReport
pnpm install

# 2. Build all monorepo packages
pnpm build
```

### Running the Application

```bash
# Start all microservices and Next.js web application concurrently
pnpm dev:all

# Alternatively, start backend microservices only
pnpm dev:services

# Or start services individually:
pnpm --filter @urbanreports/users start:dev       # Port 3001
pnpm --filter @urbanreports/complaints start:dev  # Port 3002
pnpm --filter @urbanreports/media start:dev       # Port 3003
pnpm --filter @urbanreports/maps start:dev        # Port 3004
pnpm --filter @urbanreports/gateway start:dev     # Port 3005
pnpm --filter @urbanreports/web dev               # Port 3000
```

---

## Verification & Testing

```bash
# Run unit and integration tests for API Gateway
pnpm --filter @urbanreports/gateway test

# Run unit tests for Web App
pnpm --filter @urbanreports/web test

# Run full monorepo build verification
pnpm build
```

---

## Environment Configuration

### `apps/gateway/.env`
```env
PORT=3005
USERS_SERVICE_URL=http://localhost:3001
COMPLAINTS_SERVICE_URL=http://localhost:3002
MEDIA_SERVICE_URL=http://localhost:3003
MAPS_SERVICE_URL=http://localhost:3004
FRONTEND_URL=http://localhost:3000
```

### `services/users/.env`
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/urbanreports_users
DB_NAME=urbanreports_users
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
```

### `services/complaints/.env`
```env
PORT=3002
NEON_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/urbanreports_complaints
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
USERS_SERVICE_URL=http://localhost:3001
```

### `services/media/.env`
```env
PORT=3003
MONGODB_URI=mongodb://localhost:27017/urbanreports_media
MAX_IMAGE_SIZE=10485760
PUBLIC_MEDIA_URL=http://localhost:3005/api
```

### `services/maps/.env`
```env
PORT=3004
MAPTILER_API_KEY=
```

### `apps/web/.env.local`
```env
NEXT_PUBLIC_GATEWAY_URL=http://localhost:3005
NEXT_PUBLIC_MAPTILER_API_KEY=
```

---

## API Endpoint Reference

### Authentication & Users (`/api/auth`, `/api/users`)
- `POST /api/auth/register` - Register new citizen account.
- `POST /api/auth/login` - Sign in and receive JWT token.
- `GET /api/users/me` - Fetch authenticated user profile.
- `PATCH /api/users/me` - Update profile & notification settings.

### Complaints (`/api/complaints`)
- `POST /api/complaints` - Create a new civic complaint.
- `GET /api/complaints` - List complaints with filter, search, and pagination.
- `GET /api/complaints/:id` - Fetch complaint details and status history.
- `PATCH /api/complaints/:id/status` - Update complaint status (admin/officer).
- `GET /api/complaints/nearby?lat=...&lng=...` - Spatial query for nearby complaints.
- `GET /api/complaints/viewport?minLat=...` - Spatial query for map bounding box.

### Media (`/api/media`)
- `POST /api/media` - Upload image binary (`multipart/form-data`).
- `GET /api/media/:id` - Stream image binary or metadata.
- `DELETE /api/media/:id` - Delete media file.

### Maps (`/api/maps`)
- `GET /api/maps/search?q=...` - Search places and addresses.
- `GET /api/maps/reverse?lat=...&lng=...` - Reverse geocode coordinates to address.

---

## Future Scope & Product Roadmap

The following features and enhancements represent the planned development roadmap for UrbanReports:

1. **AI Automated Issue Classification & Severity Assessment**:
   Integrate a computer vision pipeline (TensorFlow / PyTorch model or Google Cloud Vision API) to analyze uploaded evidence photos automatically. The system will auto-detect damage categories (e.g., distinguishing between a shallow road crack and a deep pothole), estimate severity levels, and flag potentially duplicate images.

2. **Real-Time WebSockets & Push Notifications**:
   Implement Socket.io and Web Push API integration to deliver instantaneous real-time alerts to citizens when their submitted complaints transition between statuses (e.g., from `IN_REVIEW` to `ASSIGNED` or `RESOLVED`). Officers will also receive real-time push alerts when high-severity complaints are submitted within their designated wards.

3. **Automated Departmental Dispatch & Polygon Geofencing**:
   Enhance the Complaints Service with PostGIS polygon spatial boundaries (`ST_Contains`). When a complaint is filed, the service will automatically resolve the location to a specific municipal ward and dispatch the complaint directly to the responsible municipal department or contractor without requiring manual admin intervention.

4. **Community Upvoting & Image-Based Duplicate Detection**:
   Implement a community validation system allowing nearby citizens to upvote and verify active complaints, increasing their priority score in municipal queues. Add perceptual image hashing (pHash) and spatial buffer checks to detect and merge duplicate reports filed for the same infrastructure defect.

5. **Municipal Executive Analytics Dashboard**:
   Develop an analytics and reporting suite for city officials featuring resolution SLA performance tracking, ward heatmaps, average repair time metrics, departmental leaderboard scorecards, and exportable PDF/CSV reports for city council audits.

6. **Offline-First Progressive Web App (PWA) & Background Sync**:
   Equip the Next.js web application with Service Worker offline caching and IndexedDB store. Citizens in low-connectivity areas can capture photos and draft complaint details offline; reports will automatically sync to the API Gateway once internet connectivity is restored.

7. **Omnichannel Reporting (WhatsApp & Telegram Bots)**:
   Extend issue reporting capabilities by deploying WhatsApp Business API and Telegram bot interfaces. Citizens will be able to share a photo and location attachment via messaging apps, which will be automatically ingested into the API Gateway as structured complaints.

8. **Contractor SLA Management & Resolution Proof**:
   Require maintenance contractors to submit mandatory completion evidence photos when marking a complaint as `RESOLVED`. Implement a citizen confirmation window where the original reporter can accept or dispute the resolution proof.

---

## License

UrbanReports is open-source software licensed under the MIT License.
