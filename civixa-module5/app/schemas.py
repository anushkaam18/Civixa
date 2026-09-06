from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertCreate(BaseModel):
    project_id: str
    project_name: str
    alert_type: str
    severity: str
    message: str


class AlertOut(AlertCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AlertUpdate(BaseModel):
    status: str


class NotificationOut(BaseModel):
    id: int
    alert_id: int
    recipient: str
    channel: str
    status: str
    created_at: datetime
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectCheckInput(BaseModel):
    project_id: str
    project_name: str
    cost_overrun_percent: float = 0
    schedule_delay_days: int = 0
    risk_score: float = 0
