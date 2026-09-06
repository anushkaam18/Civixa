# CIVIXA Module 5 — Quick Start (Banglish)

## Ei zip e ki ache
- app/main.py — FastAPI app shuru howar file
- app/models.py — Database tables (Alert, Notification, ReportHistory)
- app/schemas.py — API input/output format
- app/database.py — PostgreSQL connection
- app/services/rule_engine.py — Alert logic (cost overrun, delay, risk score)
- app/services/pdf_generator.py — PDF report banano (ReportLab diye)
- app/scheduler.py — Automatic daily report (APScheduler diye)
- app/routers/alerts.py — Alert er shob API
- app/routers/notifications.py — Notification list API
- app/routers/reports.py — PDF generate/download API

## Step by step run korার niyom

### 1. Zip extract koro
`civixa-module5` folder er ভিতরে zip er সব content বসাও
(existing venv folder er বাইরে, তার পাশে "app" folder + files গুলো থাকবে)

### 2. Notun 2 ta package install koro
venv activate thakা obosthay:
```
pip install reportlab apscheduler
```

### 3. .env file banao
`.env.example` file ta copy kore naam dao `.env`
Tার ভিতরে `YOUR_PASSWORD` er jaygay tomar PostgreSQL install korার somoy dেওয়া password ta bosao।

### 4. Database banao
Command Prompt e (venv activate thakা obosthay):
```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE civixa_module5;"
```
Password chaite pare — সেটা tomar PostgreSQL password.

### 5. Server run koro
```
uvicorn app.main:app --reload
```

### 6. Browser e test koro
`http://127.0.0.1:8000/docs` khulo — Swagger UI e shob API dekhbe, test o korte parbe direct oikhan theke.

## Test korার easy way (Swagger UI theke)
1. `/alerts/check` (POST) e click koro → "Try it out"
2. Ei data দাও:
```json
{
  "project_id": "P001",
  "project_name": "Kolkata Metro Extension",
  "cost_overrun_percent": 18,
  "schedule_delay_days": 20,
  "risk_score": 82
}
```
3. Execute korle 3 ta alert generate hoye jabe (cost, delay, risk — sob threshold cross korche)
4. `/alerts/` (GET) e giye dekho shob alert list hoyeche
5. `/reports/generate` (POST) e giye PDF report banao
6. `/reports/` (GET) diye report id dekho, `/reports/{id}/download` diye PDF download koro

Eituku hole Module 5 er core deliverables shob demo-ready:
- Alert Engine & APIs ✅
- Notification System (in-app) ✅
- Report Generator (PDF) ✅
- Scheduled Report System ✅ (background e daily run hobe)
