import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from sqlalchemy.orm import relationship  # <--- 1. Make sure this is imported!
from app.database import Base

class ProjectStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    TENDERING = "TENDERING"
    IN_PROGRESS = "IN_PROGRESS"
    DELAYED = "DELAYED"
    COMPLETED = "COMPLETED"
    HALTED = "HALTED"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    sector = Column(String(100), nullable=False)
    
    allocated_budget = Column(Float, nullable=False)
    expenditure_to_date = Column(Float, default=0.0)
    
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNED, nullable=False)
    physical_progress_pct = Column(Float, default=0.0)
    
    start_date = Column(DateTime, nullable=True)
    target_completion_date = Column(DateTime, nullable=True)
    actual_completion_date = Column(DateTime, nullable=True)
    
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # <--- 2. ADD THIS EXACT LINE:
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)