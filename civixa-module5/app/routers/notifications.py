from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[schemas.NotificationOut])
def list_notifications(db: Session = Depends(get_db)):
    return (
        db.query(models.Notification)
        .order_by(models.Notification.created_at.desc())
        .all()
    )
