from fastapi import FastAPI
from app.database import engine, Base

# Import both models so Base recognizes both tables
import app.models.project
import app.models.milestone

from app.api.projects import router as project_router
from app.api.milestones import router as milestone_router

# Auto-create both 'projects' and 'milestones' tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CIVIXA — Module 1 (Project & Data Management)",
    description="Foundational data layer and REST APIs for SIH 2026",
    version="1.0.0"
)

app.include_router(project_router)
app.include_router(milestone_router)

@app.get("/")
def root():
    return {"service": "CIVIXA Module 1", "status": "operational"}
