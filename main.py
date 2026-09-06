from fastapi import FastAPI
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

# Import all models so Base recognizes all tables
import app.models.project
import app.models.milestone
import app.models.agency
import app.models.contract
import app.models.audit

from app.api.projects import router as project_router
from app.api.milestones import router as milestone_router
from app.api.agencies import router as agency_router
from app.api.contracts import router as contract_router
from app.api.data import router as data_router

# Auto-create all tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CIVIXA — Module 1 (Project & Data Management)",
    description="Foundational data layer and REST APIs for SIH 2026",
    version="1.0.0"
)

app.include_router(project_router)
app.include_router(milestone_router)
app.include_router(agency_router)
app.include_router(contract_router)
app.include_router(data_router)

@app.get("/")
def root():
    return {"service": "CIVIXA Module 1", "status": "operational"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for the hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)