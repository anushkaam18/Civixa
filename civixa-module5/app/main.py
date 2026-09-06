from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import alerts, notifications, reports
from .scheduler import start_scheduler

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CIVIXA — Module 5: Alerts, Early Warning & Reports")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts.router)
app.include_router(notifications.router)
app.include_router(reports.router)


@app.on_event("startup")
def on_startup():
    start_scheduler()


@app.get("/")
def root():
    return {"message": "CIVIXA Module 5 API is running", "docs_url": "/docs"}
