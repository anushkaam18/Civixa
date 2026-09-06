from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..services.rule_engine import evaluate_project

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.post("/", response_model=schemas.AlertOut)
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(get_db)):
    db_alert = models.Alert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.get("/", response_model=List[schemas.AlertOut])
def list_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Alert)
    if status:
        query = query.filter(models.Alert.status == status)
    if severity:
        query = query.filter(models.Alert.severity == severity)
    if project_id:
        query = query.filter(models.Alert.project_id == project_id)
    return query.order_by(models.Alert.created_at.desc()).all()


@router.patch("/{alert_id}", response_model=schemas.AlertOut)
def update_alert_status(
    alert_id: int, update: schemas.AlertUpdate, db: Session = Depends(get_db)
):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db_alert.status = update.status
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.post("/check", response_model=List[schemas.AlertOut])
def check_project(data: schemas.ProjectCheckInput, db: Session = Depends(get_db)):
    """
    Rule-based + risk-score check. In production this data will come
    from Module 1 (project data) and Module 4 (ML risk score) APIs.
    For now, pass the values manually / from Postman to test the engine.
    """
    triggered = evaluate_project(data.dict())
    created = []
    for alert_data in triggered:
        db_alert = models.Alert(**alert_data)
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        created.append(db_alert)

        # auto-create an in-app notification for every new alert
        notif = models.Notification(
            alert_id=db_alert.id,
            recipient="project-team",
            channel="in_app",
            status="sent",
        )
        db.add(notif)
        db.commit()

    return created
