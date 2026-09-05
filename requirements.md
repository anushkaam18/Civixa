# CIVIXA — Module 1: Project & Data Management

**Project:** CIVIXA (*"Remember Infrastructure. Prevent Failures."*)  
**Hackathon:** Smart India Hackathon (SIH) 2026 | Problem Statement SIH260103 / SIH26103  
**Ministry / Dept:** Ministry of Statistics & Programme Implementation (MoSPI) — DIID  
**Module Owner:** Team Member 1 (Data Foundation & REST APIs)

---

## 1. System Requirements & Prerequisites

Before running this project, ensure your host environment has the following installed:

- **Operating System:** Linux (Arch / Ubuntu / Debian / Fedora) or macOS / WSL2
- **Python:** Version `3.10` or higher (tested on Python 3.12 / 3.14)
- **Database:** PostgreSQL `14+` running locally or on a remote server
- **Package Manager:** `pip`

---

## 2. Core Dependencies & Tech Stack

| Package | Purpose |
|---|---|
| `fastapi` | High-performance asynchronous REST API framework |
| `uvicorn` | ASGI web server for running the FastAPI application |
| `sqlalchemy` | SQL toolkit and Object-Relational Mapper (ORM) |
| `psycopg2-binary` | PostgreSQL database adapter for Python |
| `pydantic` | Data validation, constraints enforcement, and settings management |
| `alembic` | Database schema migrations and revision control |

---

## 3. Database Setup (PostgreSQL)

Execute the following commands in your terminal to set up the dedicated database and user credentials:

```bash
# 1. Switch to postgres superuser
sudo -iu postgres psql

# 2. Inside the psql console, run:
CREATE USER civixa_user WITH PASSWORD 'civixa_secret_123';
CREATE DATABASE civixa_db OWNER civixa_user;
GRANT ALL PRIVILEGES ON DATABASE civixa_db TO civixa_user;
\q