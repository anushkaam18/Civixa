# CIVIXA — Infrastructure Project Monitoring Platform

<div align="center">

**"Remember Infrastructure. Prevent Failures."**

*A web-based integrated infrastructure project-monitoring platform built for the Ministry of Statistics & Programme Implementation (MoSPI).*

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge)](https://sih.gov.in/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-blue?style=for-the-badge)](https://xgboost.readthedocs.io/)

</div>

---

## 📌 Context & Problem Statement

* **Hackathon:** Smart India Hackathon (SIH) 2026
* **Problem Statement:** `SIH260103` / `SIH26103` — *Use case on web-based integrated project-monitoring platform*
* **Category:** Software
* **Theme:** Smart Automation
* **Organization:** Ministry of Statistics & Programme Implementation (MoSPI)
* **Department:** Data Informatics & Innovation Division (DIID)

Traditional project monitoring systems merely track static deadlines and expenditure spreadsheets. **CIVIXA** goes beyond surface-level tracking by capturing **civic memory** (past complaints, historical failure modes, structural inspection audits) and feeding it into a **predictive risk engine** — proactively flagging cost overruns, timeline slippage, and structural deterioration before they occur.

---

## 🏛️ System Architecture — 6 Modules

All six modules communicate through a single **FastAPI REST API Gateway**. Shared cross-cutting services (auth, background jobs, file storage, logging, backup) sit underneath the gateway and are used by every module.

```
                  +------------------------------------------+
                  |       CIVIXA FASTAPI API GATEWAY          |
                  +------------------------------------------+
                                       |
   +-----------+-----------+-----------+-----------+-----------+
   |           |           |           |           |           |
[Module 1] [Module 2]  [Module 3]  [Module 4]  [Module 5]  [Module 6]
  Core Data     GIS      Civic Memory  Risk AI     Alerts    Dashboard
```

| # | Module | Description | Status |
|---|---|---|---|
| **1** | **Project & Data Management** | Single source of truth for projects, costs, milestones & contractors | 🟢 **In Active Development** |
| 2 | GIS & Map Module | Interactive maps, spatial search/filters, distance & area tools, geospatial analytics | 🟡 Planned |
| 3 | Civic Memory & Infrastructure Graph | Relational/graph history: complaints, repairs, inspections, previous failures, event timeline | 🟡 Planned |
| 4 | AI/ML Risk Prediction Engine | Pattern detection, risk scoring, cost/schedule overrun prediction, explainable AI (SHAP) | 🟡 Planned |
| 5 | Alerts, Early Warning & Reports | Early warning system, rule engine, notifications, scheduled PDF reports | 🟡 Planned |
| 6 | UI/UX & Main Dashboard | Next.js command center — project overview, GIS view, risk view, alerts, admin UI | 🟢 **In Active Development** |

### Shared / Cross-Cutting Services
- **Auth:** JWT / Role-Based Access Control
- **Background Tasks:** Celery + Redis (scheduled jobs, reports, ML tasks)
- **File Storage:** Documents, reports, images (cloud storage)
- **Logging & Monitoring:** System logs, error tracking, performance monitoring
- **Backup & Recovery:** Database backup, disaster recovery

### Data Flow (End-to-End)
`Data Ingestion → Store in DB → Process & Integrate → AI/ML Analysis → Risk Score & Alerts → Actionable Insights`

### Deployment Architecture
`Frontend (Vercel) → Backend API (Render/Railway) → Database (PostgreSQL/PostGIS) → File Storage (Cloud Storage)`

### Key Outcomes
Predict cost overruns · Predict schedule delays · Early risk detection · Root cause/driver analysis · Data-driven decisions · Better infrastructure planning

---

## 👥 Team & Module Ownership

Each module is owned by one team member and exposes its functionality through the shared API Gateway.

### Module 1 — Project & Data Management *(thorfinnn11)*
- **Responsibilities:** Design & implement all core databases/schemas · APIs for Projects, Assets, Agencies, Milestones, Costs, Contracts, Users · data validation & deduplication · data import/export (CSV/Excel/JSON)
- **Key Features:** Project CRUD & versioning, milestone & timeline management, cost & expenditure tracking, agency & contractor management, data quality checks
- **Tech Stack:** FastAPI · PostgreSQL · SQLAlchemy · Pydantic · Alembic
- **Deliverables:** Database schema & migrations, REST APIs for core entities, data import/export utilities, seed data & documentation

### Module 2 — GIS & Map Module *(Team Member 2)*
- **Responsibilities:** Implement GIS map & spatial features · store/visualize project & asset locations · spatial queries and map interactions · geospatial data layers & filtering
- **Key Features:** Interactive map (Leaflet + OSM), project/asset location plotting, spatial search & filters, distance & area measurements, layer management
- **Tech Stack:** Next.js, TypeScript (frontend) · Leaflet, OpenStreetMap (map lib) · PostGIS (database) · Turf.js, GeoJSON
- **Deliverables:** Interactive GIS map, spatial APIs & queries, map layer management, location-based project view

### Module 3 — Civic Memory & Infrastructure Graph *(Team Member 3)*
- **Responsibilities:** Build the infrastructure relationship graph · store historical events (complaints, repairs, inspections, maintenance) · visualize relationships between entities · provide a history timeline for assets/projects
- **Key Features:** Infrastructure relationship graph, complaint/repair/inspection history, asset timeline view, graph-based entity connections, event versioning & history
- **Tech Stack:** FastAPI (backend) · Neo4j AuraDB Free (graph DB) · React Flow / Cytoscape.js (graph viz) · PostgreSQL (fallback)
- **Deliverables:** Infrastructure graph viewer, history APIs & timeline, graph algorithms (connections), documentation & sample data

### Module 4 — AI/ML Risk Prediction Engine *(Team Member 4)*
- **Responsibilities:** Build ML models for risk prediction · cost overrun, time overrun & implementation risk prediction · driver analysis & root-cause identification · model training, evaluation & optimization
- **Key Features:** Risk score prediction, cost overrun prediction, time overrun prediction, driver/root cause analysis, explainable AI (SHAP)
- **Tech Stack:** Python · Scikit-learn, XGBoost · SHAP (explainability) · Pandas, NumPy, Joblib
- **Deliverables:** Trained ML models, prediction APIs, risk score & driver analysis, model performance report

### Module 5 — Alerts, Early Warning & Reports *(Team Member 5)*
- **Responsibilities:** Implement early warning & alert system · notification engine (email/in-app) · generate analytical reports · scheduled reports & alerts
- **Key Features:** Early warning alerts, rule-based & ML-based alerts, email/in-app notifications, custom report generation (PDF), scheduled reports
- **Tech Stack:** FastAPI (backend) · Celery/APScheduler (scheduler) · Redis (queue/cache) · Jinja2, WeasyPrint (PDF)
- **Deliverables:** Alert engine & APIs, notification system, report templates & generator, scheduled report system

### Module 6 — UI/UX & Main Dashboard *(Team Member 6)*
- **Responsibilities:** Build the responsive web interface · dashboards, charts, KPIs & workflows · LLM assistant for natural-language queries (optional) · overall UX & accessibility
- **Key Features:** Role-based dashboards, KPIs & analytics charts, project/asset 360° view, natural language query (LLM), user management UI
- **Tech Stack:** Next.js, TypeScript (frontend) · Tailwind CSS, ShadCN/UI (UI lib) · Recharts/Chart.js (charts) · OpenAI/local LLM (optional)
- **Deliverables:** Web dashboard & UI, LLM assistant (query interface), charts & visualizations, responsive & accessible UI

---

## 📦 What's Built So Far — Module 1 (Project & Data Management)

This repository currently implements **Module 1**, the foundational data layer that Modules 2–6 will build on top of:

1. **Relational Database Schema (PostgreSQL + SQLAlchemy)**
   - **`projects` Table:** Master registry containing official tender IDs, sectoral classification (Roads, Railways, Water, Energy), allocated budgets, physical progress, execution state, and geocoordinates.
   - **`milestones` Table:** Relational `1 : N` hierarchical work-breakdown structure tied to parent projects.
2. **Automated Progress & Expenditure Rollup Engine**
   - Whenever a milestone is marked `ACHIEVED` or its expenditure is logged, the engine automatically recalculates and rolls up the parent project's total `expenditure_to_date` and `physical_progress_pct`.
3. **Master Data Deduplication & Validation (Pydantic v2)**
   - Strict constraint validation preventing negative financial allocations, invalid lat/long bounds, or duplicate tender registration codes.
4. **Auto-Documenting OpenAPI/Swagger Interfaces**
   - Live interactive documentation and contract-first schema delivery so other modules can start integrating immediately.

### Project Directory Structure (Module 1)

```text
civixa-module1/
├── app/
│   ├── __init__.py
│   ├── database.py              # PostgreSQL connection pool & session dependency
│   ├── models/                  # SQLAlchemy ORM Database Models
│   │   ├── __init__.py
│   │   ├── project.py           # Project master entity
│   │   └── milestone.py         # Milestone entity (1:N foreign key to Project)
│   ├── schemas/                 # Pydantic Schemas (Input/Output API contracts)
│   │   ├── __init__.py
│   │   ├── project.py           # Project validation models
│   │   └── milestone.py         # Milestone validation models
│   └── api/                     # REST API Route Handlers
│       ├── __init__.py
│       ├── projects.py          # /projects endpoints
│       └── milestones.py        # /milestones endpoints & rollup calculations
├── main.py                      # FastAPI application bootstrap & router registration
├── requirements.txt             # Pinned package dependencies
├── requirements.md              # Detailed technical prerequisite guide
├── .gitignore                   # Version control exclusion rules
└── README.md                    # Project documentation
```

> Modules 2–6 are expected to follow a similar `app/models` · `app/schemas` · `app/api` layout in their own service folders, so the whole team stays consistent when everything is merged behind the API Gateway.

---

## 🚀 Getting Started (Module 1)

### 1. Prerequisites

- Python 3.10+
- PostgreSQL 14+

### 2. Database Initialization

Create the database and service user inside your PostgreSQL instance:

```sql
CREATE USER civixa_user WITH PASSWORD 'civixa_secret_123';
CREATE DATABASE civixa_db OWNER civixa_user;
GRANT ALL PRIVILEGES ON DATABASE civixa_db TO civixa_user;
```

### 3. Installation & Run

```bash
# Clone the repository
git clone <your-repository-url>
cd civixa-module1

# Create and activate an isolated virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
python -m uvicorn main:app --reload
```

The server will initialize on: **http://127.0.0.1:8000**

---

## 🧪 Interactive API Documentation

Once the server is booted, access the built-in documentation suites:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

---

## 📡 Module 1 Endpoints (Implemented)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service health status check |
| POST | `/projects/` | Create a new infrastructure project (with unique tender validation) |
| GET | `/projects/` | Paginated list of all registered infrastructure projects |
| GET | `/projects/{id}` | Detailed project dossier by ID |
| POST | `/projects/{id}/milestones` | Attach a structured execution milestone to a project |
| GET | `/projects/{id}/milestones` | Retrieve milestone breakdown for a given project |
| PATCH | `/milestones/{id}` | Update milestone status, log expenditure, and trigger auto-rollup |

---

## 🔮 Project Roadmap — What's Left to Implement

### Module 1 — Project & Data Management (this repo)
- **Phase 3:** Contractor & Agency entities with contract allocation
- **Phase 4:** Deduplication rules for milestone sequence orders
- **Phase 5:** Bulk CSV/Excel master data ingestion for historical MoSPI datasets
- **Alembic:** Structured database schema migration tracking

### Module 2 — GIS & Map Module
- Interactive map integration (Leaflet + OpenStreetMap) consuming Module 1's project/asset coordinates
- Spatial search, filters, and distance/area tools
- PostGIS-backed geospatial analytics layer

### Module 3 — Civic Memory & Infrastructure Graph
- Graph schema in Neo4j AuraDB (or PostgreSQL fallback) for complaints, repairs, inspections, and failures
- Event timeline API tied to Module 1's project/asset IDs
- Graph visualization (React Flow / Cytoscape.js)

### Module 4 — AI/ML Risk Prediction Engine
- Training pipeline using historical data from Modules 1 & 3
- Cost overrun, schedule delay, and deterioration prediction models (Scikit-learn/XGBoost)
- SHAP-based explainability layer and prediction API

### Module 5 — Alerts, Early Warning & Reports
- Rule engine + ML-driven alert triggers consuming Module 4's risk scores
- Email/in-app notification pipeline
- Scheduled PDF report generation (Jinja2 + WeasyPrint)

### Module 6 — UI/UX & Main Dashboard
- Next.js dashboard consuming all module APIs through the gateway
- Project overview, GIS view, risk analysis view, alerts & reports view
- Role-based access UI and (optional) natural-language query assistant

### Shared / Platform-Wide
- JWT authentication & role-based access control across all modules
- Celery + Redis background job infrastructure
- Centralized logging, monitoring, and backup/disaster-recovery setup
- CI/CD and deployment (Vercel for frontend, Render/Railway for backend, cloud storage for files)

---

## 🤝 Contributing (Team Workflow)

- Each module should be developed in its own branch/folder and expose a clean REST contract before integrating with the API Gateway.
- Module 1's Pydantic schemas and OpenAPI docs (`/docs`) are the source of truth for `project_id` / `asset_id` fields other modules depend on — check there before assuming a field name.
- Keep "current state" data in Module 1 and "historical/relationship" data in Module 3 to avoid duplicate or conflicting records between modules.
