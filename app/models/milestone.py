import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class MilestoneStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    ACHIEVED = "ACHIEVED"
    DELAYED = "DELAYED"
    BLOCKED = "BLOCKED"

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    # Foreign key tying this milestone to a specific project
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sequence_order = Column(Integer, default=1)  # 1, 2, 3... order of execution
    
    # Financial allocation for this specific phase (INR)
    target_budget = Column(Float, default=0.0)
    actual_expenditure = Column(Float, default=0.0)
    
    # Progress weight (e.g. Foundation is 25% of total project)
    weight_percentage = Column(Float, default=10.0)
    status = Column(Enum(MilestoneStatus), default=MilestoneStatus.PENDING, nullable=False)
    
    # Target and actual dates
    due_date = Column(DateTime, nullable=True)
    achieved_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship back to the parent Project object
    project = relationship("Project", back_populates="milestones")
