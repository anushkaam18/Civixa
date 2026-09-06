from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, index=True)
    project_name = Column(String)
    title = Column(String,nullable=False,default="Alert")
    alert_type = Column(String)       # cost_overrun, schedule_delay, risk_score
    severity = Column(String)         # low, medium, high, critical
    message = Column(Text)
    status = Column(String, default="open")   # open, acknowledged, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, index=True)
    recipient = Column(String)
    channel = Column(String, default="in_app")   # in_app, email
    status = Column(String, default="pending")   # pending, sent, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)


class ReportHistory(Base):
    __tablename__ = "report_history"

    id = Column(Integer, primary_key=True, index=True)
    report_name = Column(String)
    file_path = Column(String)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
