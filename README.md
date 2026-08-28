# UrbanReports - Map-First Civic Issue Reporting Platform

UrbanReports is a modern, map-first civic engagement platform empowering citizens to report infrastructure, safety, and public amenity issues (potholes, broken streetlights, garbage, water leaks, traffic signals, drainage problems) directly to municipal authorities.

## Architecture & Monorepo Overview

UrbanReports is built with a scalable pnpm monorepo structure designed to transition seamlessly from Phase 1 (Frontend Foundation with Mock Repositories) into Phase 2 (Microservices Architecture).

```
urbanreports/
├── apps/
│   ├── web/           # Next.js 15 App Router Frontend Application
│   └── gateway/       # API Gateway Service (Phase 2)
├── services/          # Microservices (Phase 2: users, complaints, maps, media, admin, notifications, worker)
├── packages/          # Shared Contracts & Utilities (Phase 2)
├── infra/             # Deployment & Docker Manifests
└── docs/              # Architecture Documentation
```

## Quick Start (Phase 1 Frontend)

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd UrbanReport
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Run development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Phase 1 Feature Checklist
- [x] Map-first landing page and full-screen interactive MapView (MapLibre GL JS)
- [x] Citizen Complaint Reporting Flow with photo upload preview & pin picker
- [x] Complaint Directory with category, severity, and status filters
- [x] Detailed Complaint Tracker with visual lifecycle timeline
- [x] Citizen Authentication & Aadhaar local validation UI
- [x] Citizen Profile Dashboard with submitted reports status
- [x] Admin Complaint Management Dashboard with resolution controls & assignment
