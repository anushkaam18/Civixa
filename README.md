# CIVIXA — Frontend Architecture & Integration Documentation

> **Branch:** `frontend`
> **Framework:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
> **Deployment Node:** Local Dev (`http://localhost:3000`) & Production Container
> **Central Backend:** Oracle Cloud Infrastructure (OCI) PostgreSQL Engine (`http://129.159.238.173:8000`)

---

## 1. System Overview

CIVIXA is an institutional infrastructure intelligence platform designed for monitoring, auditing, and forecasting large-scale capital expenditure projects (highways, railways, dams, urban utilities).

The `frontend` branch interfaces with a high-throughput REST backend to provide:

1. **Executive Dashboard (`/`):** Real-time portfolio KPIs, capital allocation totals, and attention queues.
2. **Projects Portfolio (`/projects`):** Search, sector filter, status filter, and live modal for registering government tenders.
3. **Project Dossier (`/projects/[id]`):** Deep-dive monitoring of individual projects, sequential Work Breakdown Structure (WBS) phases, and an immutable institutional audit ledger.

---

## 2. Directory Structure

```text
civixa-frontend/
├── app/
│   ├── layout.tsx                # Global root layout & font definitions
│   ├── page.tsx                  # Executive Monitoring Dashboard (C-Suite KPIs & Portfolio Health)
│   ├── globals.css               # Global Tailwind directives & styling tokens
│   ├── lib/
│   │   └── api.ts                # Typed SDK & data fetching layer communicating with OCI backend
│   └── projects/
│       ├── page.tsx              # Projects Directory, Filter Engine & "+ Add Project" Modal
│       └── [id]/
│           └── page.tsx          # Project Dossier, Baseline Revision Modal & Milestone Engine
├── components/
│   ├── sidebar.tsx               # Primary CIVIXA navigation sidebar (Dashboard, Projects, GIS, etc.)
│   └── ...                       # Shared visual UI components
├── public/                       # Static assets & icons
├── .env.local                    # Environment configuration (API Base URLs)
└── package.json                  # Dependencies (Next.js 16, Lucide, Tailwind CSS)
```

---

## 3. Environment & Backend Configuration

The frontend dynamically communicates with the Oracle VPS backend. Configuration is controlled through environment variables.

**`.env.local`** (or container environment):

```env
NEXT_PUBLIC_API_URL=http://129.159.238.173:8000
```

**Fallback Handling:** If `NEXT_PUBLIC_API_URL` is omitted, `app/lib/api.ts` and UI views default gracefully to `http://129.159.238.173:8000`.

---

## 4. Key Pages & Functional Modules

### 4.1. Executive Dashboard (`app/page.tsx`)

- **Route:** `/`
- **Backend Calls:**
  - `GET /projects/summary/stats` — Aggregates total projects, total sanctioned capital, disbursed funds, and status breakdown.
  - `GET /projects/` — Populates the Priority Queue with projects flagged as `DELAYED`, `HALTED`, or with physical progress under 50%.
  - `GET /api/alerts` — Reads real-time active system alerts.
- **Key Metrics Displayed:**
  - Projects Monitored
  - Total Sanctioned Capital (₹ in Crores)
  - Delayed / Halted Alert Counter
  - Average Delivery Velocity (Weighted Progress %)
  - Portfolio Health breakdown bar (In Progress vs. Tendering vs. Delayed)

### 4.2. Projects Directory & Registration (`app/projects/page.tsx`)

- **Route:** `/projects`
- **Backend Calls:**
  - `GET /projects/?sector={sector}&status={status}` — Server-side filtered query.
  - `POST /projects/` — Creates a new project in the PostgreSQL database.
- **Features:**
  - **Live Search:** Instant client-side search across Tender ID, Project Title, State, and District.
  - **Sector & Status Filter:** Filters between Roads & Highways, Railways & Metro, Water Resources, Power & Energy, and Urban Development.
  - **Register New Project Modal** (`+ Register New Project`):
    - Input fields: Tender ID, Sector, Title, Budget (INR), Initial Status, State, District, GPS Coordinates (Latitude/Longitude).
    - Writes directly to the database and re-fetches the portfolio view without a full page reload.

### 4.3. Project Dossier & Audit Engine (`app/projects/[id]/page.tsx`)

- **Route:** `/projects/[id]` (e.g. `/projects/1`, `/projects/2`)
- **Backend Calls:**
  - `GET /projects/{id}` — Detailed project metadata, budget utilization, and progress.
  - `GET /projects/{id}/milestones` — Work Breakdown Structure phases.
  - `GET /projects/{id}/history` — Institutional memory and audit trail records.
  - `PATCH /projects/{id}` — Commits baseline budget, status, or title revisions.
  - `POST /projects/{id}/milestones` — Adds sequential execution phases.
- **Key Features:**
  - **Revise Baseline Modal** (`✎ Revise Baseline`): Allows authorized engineers to modify budget and status. Requires entering a mandatory Justification Reason which enters the immutable audit trail.
  - **Add Phase Modal** (`+ Add Phase`): Dynamically append sequential milestones with weighted percentages and targets.
  - **Audit Ledger Normalization:**
    - Strips backend internal prefixes (e.g. converts `ProjectStatus.TENDERING` to `TENDERING`).
    - Filters out duplicate or redundant status entries.
    - Shows clear strikethroughs on old values: ~~TENDERING~~ ➔ DELAYED.
    - Formats large numbers into Indian Crores (₹1,840 Cr ➔ ₹2,140 Cr).

---

## 5. API Data Models (`app/lib/api.ts`)

| Type | Fields | Description |
|------|--------|-------------|
| `BackendProject` | `id`, `tender_id`, `title`, `sector`, `allocated_budget`, `expenditure_to_date`, `physical_progress_pct`, `status`, `state`, `district`, `latitude`, `longitude` | Core project schema representation |
| `BackendMilestone` | `id`, `project_id`, `sequence_order`, `title`, `target_budget`, `actual_expenditure`, `weight_percentage`, `status` | Work Breakdown Structure phase |
| `AuditHistoryRecord` | `id`, `project_id`, `field_name`, `old_value`, `new_value`, `change_reason`, `changed_by`, `timestamp` | Immutable change ledger |
| `ExecutiveStats` | `total_projects`, `total_allocated_budget`, `total_expenditure`, `overall_average_progress_pct`, `status_breakdown` | High-level portfolio aggregates |

---

## 6. Local Development & Startup

### Prerequisites

- Node.js 18.18+ or 20+
- npm or pnpm

### Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Clear corrupted cache if previously interrupted
rm -rf .next

# 3. Start development server on port 3000
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 7. Git Workflow (Branch: `frontend`)

To make updates and push to this branch:

```bash
# Verify you are on the frontend branch
git checkout frontend

# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: <description of changes>"

# Push directly to GitHub
git push origin frontend
```
