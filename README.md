# 🏛️ CIVIXA — Module 1: Project & Data Management Engine

> **"Remember Infrastructure. Prevent Failures."**
> *Smart India Hackathon 2026 (Problem Statement ID: SIH260103 — Ministry of Statistics and Programme Implementation - MoSPI)*

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-orange?style=for-the-badge)](https://alembic.sqlalchemy.org/)

---

## 📌 Executive Summary

**CIVIXA Module 1** serves as the authoritative transactional core and single source of truth for the entire CIVIXA ecosystem. It models, ingests, deduplicates, and exposes critical infrastructure data for central sector public works projects across India.

### Inter-Module Integration Role

- **For Module 2 (GIS Spatial Layer):** Supplies validated GIS coordinates (`latitude`, `longitude`) and geospatial metadata for mapping pipelines.
- **For Module 3 (Civic Memory Graph):** Provides an immutable, append-only historical audit ledger (`project_history`) tracking every budget revision, deadline push, and status change.
- **For Module 4 (AI Risk Engine):** Feeds structured contractor track records, bid-versus-sanction expenditure deltas, and milestone delay patterns into predictive models.
- **For Module 6 (Frontend UI/UX):** Exposes high-performance, CORS-enabled RESTful APIs and real-time aggregate KPI endpoints for instant dashboard rendering.

---

## 🏗️ System Architecture & Data Model

The database layer consists of 5 normalized relational entities built on **PostgreSQL 16+** and orchestrated via **SQLAlchemy 2.0**:

```text
               +-------------------------------------------------------------+
               |                       projects                              |
               |  PK: id                                                     |
               |  UK: tender_id                                              |
               |  title, budget, expenditure_to_date, physical_progress_pct  |
               |  status, state, district, latitude, longitude               |
               +-------------------------------------------------------------+
                        | 1:N                                     | 1:N
                        |                                         |
                        v                                         v
         +-----------------------------+           +------------------------------+
         |         milestones          |           |          contracts           |
         |  PK: id                     |           |  PK: id                      |
         |  FK: project_id             |           |  UK: contract_number         |
         |  seq_order, weight_pct      |           |  FK: project_id              |
         |  target_budget, actual_exp  |           |  FK: agency_id               |
         |  status                     |           |  awarded_amount, type        |
         +-----------------------------+           +------------------------------+
                        |                                         | N:1
                        v                                         v
         +-----------------------------+           +------------------------------+
         |       project_history       |           |           agencies           |
         |  PK: id                     |           |  PK: id                      |
         |  FK: project_id             |           |  UK: registration_no         |
         |  field_name, old/new_val    |           |  name, rating, agency_type   |
         |  reason, changed_by, stamp  |           |  blacklisted (0 or 1)        |
         +-----------------------------+           +------------------------------+
```

### Core Business Logic Implemented

1. **Deduplication Engine**
   - Strict rejection of duplicate `tender_id` values.
   - Dual-level constraint on milestones: unique `(project_id, sequence_order)` and `(project_id, title)`.
   - Contractor registry deduplication by tax registration/GST and corporate email.

2. **Automatic Rollup Engine**
   - Marking a milestone `ACHIEVED` automatically recalculates the parent project's `expenditure_to_date` and `physical_progress_pct`.
   - Instantly updates parent project metrics and executive summary totals.

3. **Contractor Blacklist Protection**
   - Rejects tender awards to any contractor flagged with `blacklisted = 1`.

4. **Append-Only Civic Memory Audit Ledger**
   - Every modification to a project's timeline, budget, or status automatically creates an immutable audit snapshot with the engineer's justification and timestamp.

5. **Bulk Ingestion & Streaming Reports**
   - Asynchronous streaming CSV upload supporting legacy MoSPI spreadsheets.
   - One-click dynamic CSV export of the entire database registry.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites

- **Python:** 3.11+ (tested on Python 3.14)
- **PostgreSQL:** Installed and active (`localhost:5432`)
- **Git**

### 2. Database Initialization

Log into PostgreSQL and create the database user and schema:

```sql
CREATE DATABASE civixa_db;
CREATE USER civixa_user WITH ENCRYPTED PASSWORD 'civixa_secret_123';
GRANT ALL PRIVILEGES ON DATABASE civixa_db TO civixa_user;
ALTER DATABASE civixa_db OWNER TO civixa_user;
```

### 3. Clone and Setup Environment

```bash
git clone https://github.com/YOUR_ORGANIZATION/civixa-backend.git
cd civixa-backend
git checkout module1

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Apply Database Migrations (Alembic)

Run the version-controlled migration to set up all tables and constraints:

```bash
alembic upgrade head
```

### 5. Launch the FastAPI Development Server

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Server will be operational at:

- **API Base:** http://127.0.0.1:8000
- **Interactive Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc Schema Documentation:** http://127.0.0.1:8000/redoc

---

## 📡 REST API Reference

For detailed TypeScript interfaces and frontend state management, refer to [`FRONTEND_API_SPEC.md`](./FRONTEND_API_SPEC.md).

### 1. Projects (`/projects`)

- `GET /projects/` — List projects (with pagination, sector, status, state filters).
- `POST /projects/` — Register a new project with tender validation.
- `GET /projects/{id}` — Get complete project overview dossier.
- `PATCH /projects/{id}` — Update metadata, budget, or status (triggers audit logging).
- `GET /projects/{id}/history` — Retrieve chronological audit change ledger.
- `GET /projects/summary/stats` — Real-time aggregate KPIs for dashboard summary cards.

### 2. Milestones (`/milestones` & `/projects/{id}/milestones`)

- `GET /projects/{id}/milestones` — Fetch all milestones ordered by sequence.
- `POST /projects/{id}/milestones` — Add a milestone with sequence & weight validation.
- `GET /milestones/{id}` — Get single milestone details.
- `PATCH /milestones/{id}` — Log expenditure or mark achieved (auto-rolls up to project).

### 3. Agencies & Contractors (`/agencies`)

- `GET /agencies/` — Directory of registered contractors and public agencies.
- `POST /agencies/` — Register contractor with GST and email validation.
- `GET /agencies/{id}` — Contractor profile and performance track record.
- `PATCH /agencies/{id}` — Update rating or flag/blacklist contractor.

### 4. Contracts & Tender Awards (`/contracts`)

- `GET /contracts/` — List all active and past contracts.
- `POST /contracts/` — Award contract to agency for a project (enforces blacklist protection).
- `GET /contracts/{id}` — Contract financial terms, milestones, and penalty clauses.
- `PATCH /contracts/{id}` — Update status or record liquidated damages/penalties.

### 5. Bulk Data Ingestion & Reports (`/data`)

- `POST /data/import/csv` — Asynchronous bulk upload of projects via CSV spreadsheet.
- `GET /data/export/csv` — Stream and download complete project registry as CSV.
- `GET /data/template/csv` — Download pre-formatted empty CSV template.

---

## 📂 Project Structure

```text
civixa-module1/
├── alembic/                      # Database migration scripts & environments
│   ├── versions/                 # Version-controlled migration revisions
│   └── env.py                    # Alembic schema metadata hook
├── app/
│   ├── api/                      # FastAPI Router Modules
│   │   ├── projects.py           # Projects CRUD, history, and stats
│   │   ├── milestones.py         # Milestones & automatic rollup engine
│   │   ├── agencies.py           # Contractor management
│   │   ├── contracts.py          # Tender award bridge & blacklist guard
│   │   └── data.py               # CSV bulk ingestion & streaming export
│   ├── models/                   # SQLAlchemy 2.0 ORM Relational Models
│   │   ├── project.py
│   │   ├── milestone.py
│   │   ├── agency.py
│   │   ├── contract.py
│   │   └── audit.py
│   ├── schemas/                  # Pydantic v2 Serialization & Validation Schemas
│   │   ├── project.py
│   │   ├── milestone.py
│   │   ├── agency.py
│   │   ├── contract.py
│   │   ├── audit.py
│   │   └── stats.py
│   └── database.py               # Database engine, connection pooling & SessionLocal
├── main.py                       # Application entrypoint & CORS middleware
├── alembic.ini                   # Alembic configuration file
├── FRONTEND_API_SPEC.md          # Complete API handover doc for Module 6 (Frontend)
├── requirements.txt              # Pinned Python package dependencies
└── README.md                     # Project documentation
```

---

## 🔒 Security & Quality Standards

- **CORS Configured:** Fully integrated `CORSMiddleware` supporting seamless cross-origin requests from React/Next.js client applications.
- **SQL Injection Prevention:** Strictly powered by SQLAlchemy parameterized queries and ORM mappings.
- **Input Sanitization:** Strong typing, numeric range bounds, and RFC email format validation via Pydantic v2.
- **Transactional Integrity:** ACID guarantees across complex multi-table actions (e.g. milestone completion rollup and audit snapshots execute in coordinated database transactions).

---

## 👥 Authors & Team

- **Team CIVIXA** — Smart India Hackathon 2026
- **Module 1 Lead:** Project & Data Management Architecture
