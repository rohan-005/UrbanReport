# UrbanReports - Map-First Civic Issue Reporting Platform

UrbanReports is an evaluation-ready, map-first civic issue reporting and municipal resolution platform. It empowers citizens to report infrastructure, safety, and environmental issues (potholes, overflowing garbage, broken streetlights, storm drain clogging, burst water mains, traffic signal malfunctions, etc.) directly to city authorities, track live repair progress, and view transparent resolution timelines.

---

## 🏛️ Phase 1 Architecture Overview

UrbanReports is architected as a **pnpm monorepo** prepared for seamless expansion into a Phase 2 microservices architecture. Phase 1 provides an independently deployable, client-side reactive frontend foundation powered by TypeScript Repository Pattern mocking.

```
urbanreports/
├── apps/
│   ├── web/                    # Next.js 15 App Router Frontend Application
│   └── gateway/                # API Gateway Placeholder (Phase 2)
├── services/                   # Microservices Placeholders (Phase 2: users, complaints, maps, media, admin, notifications, worker)
├── packages/                   # Shared Contracts & Auth Libraries (Phase 2)
├── infra/                      # Infrastructure & Docker Setup (Phase 2)
├── docs/                       # Architecture Documentation
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .editorconfig
└── README.md
```

---

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) & React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Lucide Icons
- **Geospatial Mapping**: MapLibre GL JS
- **State & Data Layer**: Reactive In-Memory TypeScript Repository Pattern (`MockComplaintRepository`, `MockAuthRepository`)
- **Monorepo Engine**: pnpm & Turborepo
- **Testing**: Vitest

---

## 🌐 Routes & Navigation Sitemap

| Route | Access | Description |
|---|---|---|
| `/` | Public | **Map-First Landing Page**: Hero section, live map preview, statistics counters, categories showcase, and how-it-works workflow. |
| `/map` | Public | **Interactive Full-Screen Map**: Geospatial complaint markers, category/severity/status filtering, and detail previews. |
| `/complaints` | Public | **Civic Issue Directory**: Searchable, filterable complaint list with grid view, sorting, and upvotes. |
| `/complaints/[id]` | Public | **Complaint Dossier & Timeline**: Detailed report overview, location map pin, evidence gallery, and lifecycle progress timeline. |
| `/report` | Citizen | **Report Issue Form**: Category selector, title, description, severity selector, interactive location pin picker, and photo evidence uploader. |
| `/login` | Public | **Citizen & Admin Login**: Mock user authentication session. |
| `/register` | Public | **Citizen Registration**: Registration form with local 12-digit Aadhaar format validation. |
| `/profile` | Citizen | **Citizen Dashboard**: Personal report statistics, active/resolved tabs, and notification preferences. |
| `/admin` | Admin | **Municipal Admin Desk**: High-level telemetry cards, critical emergency alerts, and recent triage queue. |
| `/admin/complaints` | Admin | **Admin Resolution Queue**: Searchable, filterable table view of all municipal complaints. |
| `/admin/complaints/[id]` | Admin | **Admin Action Control**: Status transition controls (Verify, Assign, In Progress, Resolve, Reopen, Reject) and Department Assignment Panel. |

---

## 🔐 Aadhaar Local Validation Policy

Aadhaar input on registration is locally format-validated:
- Must contain exactly 12 numeric digits (`5555 6666 7777`).
- Cannot start with `0` or `1`.
- Cannot consist of a single repeated digit (e.g. `000000000000`).

> [!IMPORTANT]
> **Phase 1 Security Disclaimer**: Aadhaar validation is executed entirely on the client side for evaluation purposes. No connection to UIDAI exists, and raw Aadhaar numbers are never transmitted or stored.

---

## 🛠️ Local Development & Testing Instructions

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x

### Quick Setup

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repository-url>
   cd UrbanReport
   pnpm install
   pnpm approve-builds --all
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example apps/web/.env.local
   ```
   *(Note: MapLibre GL JS map loads with vector tiles even if `NEXT_PUBLIC_MAPTILER_API_KEY` is omitted).*

3. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Execute Verification Commands**:
   - **TypeScript Typecheck**: `pnpm typecheck`
   - **ESLint**: `pnpm lint`
   - **Unit Tests**: `pnpm test`
   - **Production Build**: `pnpm build`

---

## 🔮 Future Phase 2 Microservices Architecture Roadmap

When transitioning from Phase 1 into Phase 2, the client-side `MockComplaintRepository` will be swapped with API client contracts pointing to backend microservices:

- `services/users`: User identity & authentication
- `services/complaints`: PostgreSQL + PostGIS spatial persistence
- `services/maps`: MapTiler / Mapbox vector tile server
- `services/media`: S3 / MinIO media storage
- `services/admin`: Municipal department dispatch & officer assignment
- `services/notifications`: SMS & Nodemailer notifications
