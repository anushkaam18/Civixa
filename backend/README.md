# CIVIXA — Module 1: Project & Data Management Engine

<div align="center">

**"Remember Infrastructure. Prevent Failures."**

*Foundation module of CIVIXA — a web-based integrated infrastructure project-monitoring platform built for the Ministry of Statistics & Programme Implementation (MoSPI), for Smart India Hackathon 2026.*

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge)](https://sih.gov.in/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)

</div>

> This README covers **Module 1 only**. For the full CIVIXA architecture and all six modules, see the main project README on the primary branch.

---

## 📌 What This Module Is

Module 1 is the **foundational data layer** of CIVIXA — the single source of truth for infrastructure projects, milestones, costs, agencies, and users. Modules 2–6 (GIS, Civic Memory Graph, AI/ML Risk Engine, Alerts, Dashboard) all read from or reference the data this module owns via `project_id` / `asset_id`.

**Owned responsibilities:**
- Core database schema & migrations for Projects, Assets, Agencies/Contractors, Milestones, Costs/Expenditure, Contracts, Users
- REST APIs (CRUD) for all of the above
- Data validation & deduplication (master data management)
- CSV/Excel/JSON import & export utilities

**Tech Stack:** FastAPI · PostgreSQL · SQLAlchemy · Pydantic · Alembic

---

## 📦 What's Implemented So Far

1. **Relational Database Schema (PostgreSQL + SQLAlchemy)**
   - **`projects` table:** master registry — tender IDs, sectoral classification (Roads, Railways, Water, Energy), allocated budgets, physical progress, execution state, geocoordinates.
   - **`milestones` table:** relational `1 : N` work-breakdown structure tied to a parent project.
2. **Automated Progress & Expenditure Rollup Engine**
   - When a milestone is marked `ACHIEVED` or its expenditure is logged, the engine auto-recalculates the parent project's `expenditure_to_date` and `physical_progress_pct`.
3. **Master Data Deduplication & Validation (Pydantic v2)**
   - Rejects negative financial allocations, invalid lat/long bounds, and duplicate tender registration codes.
4. **Auto-Documenting OpenAPI/Swagger Interfaces**
   - Live interactive docs so other module owners can integrate without waiting on written specs.

---

## 🗂️ Project Directory Structure

```text
CIVIXA-MODULE1/
├── app/
│   ├── __init__.py               # (add if missing — keeps app/ a proper package)
│   ├── database.py                # PostgreSQL connection pool & session dependency
│   ├── models/                    # SQLAlchemy ORM Database Models
│   │   ├── __init__.py
│   │   ├── project.py             # Project master entity
│   │   └── milestone.py           # Milestone entity (1:N foreign key to Project)
│   ├── schemas/                   # Pydantic Schemas (Input/Output API contracts)
│   │   ├── __init__.py
│   │   ├── project.py             # Project validation models
│   │   └── milestone.py           # Milestone validation models
│   └── api/                       # REST API Route Handlers
│       ├── __init__.py
│       ├── projects.py            # /projects endpoints
│       └── milestones.py          # /milestones endpoints & rollup calculations
├── main.py                        # FastAPI application bootstrap & router registration
├── requirements.txt               # Pinned package dependencies
├── requirements.md                # Detailed technical prerequisite guide
├── .gitignore                     # Excludes venv/, __pycache__/, *.pyc, .env
└── README.md                      # This file
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Python 3.10+
- PostgreSQL 14+

### 2. Database Initialization

```sql
CREATE USER civixa_user WITH PASSWORD 'civixa_secret_123';
CREATE DATABASE civixa_db OWNER civixa_user;
GRANT ALL PRIVILEGES ON DATABASE civixa_db TO civixa_user;
```
> Move the password into a `.env` file before pushing — don't commit real credentials.

### 3. Installation & Run

```bash
# Clone the repository and switch to the module1 branch
git clone <your-repository-url>
cd civixa-module1
git checkout module1

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

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

---

## 📡 Endpoints Implemented

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

## ✅ Pre-Push Checklist

- [x] `git status` shows no `venv/` or `__pycache__/` entries
- [x] `.gitignore` includes `venv/`, `__pycache__/`, `*.pyc`, `.env`
- [x] No hardcoded DB credentials in `database.py` — pulled from `.env` instead
- [x] `app/__init__.py` exists alongside `models/`, `schemas/`, `api/` inits
- [x] `/docs` loads cleanly and every endpoint above responds as expected

---

## 🔮 Next Development Steps

- **Phase 3:** Contractor & Agency entities with contract allocation
- **Phase 4:** Deduplication rules for milestone sequence orders
- **Phase 5:** Bulk CSV/Excel master data ingestion for historical MoSPI datasets
- **Alembic:** Structured database schema migration tracking
