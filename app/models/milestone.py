import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, UniqueConstraint
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
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sequence_order = Column(Integer, default=1, nullable=False)
    
    target_budget = Column(Float, default=0.0)
    actual_expenditure = Column(Float, default=0.0)
    
    weight_percentage = Column(Float, default=10.0)
    status = Column(Enum(MilestoneStatus), default=MilestoneStatus.PENDING, nullable=False)
    
    due_date = Column(DateTime, nullable=True)
    achieved_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="milestones")

    # Deduplication Constraints:
    __table_args__ = (
        # Within the same project, sequence_order must be unique (cannot have two Step 1s)
        UniqueConstraint("project_id", "sequence_order", name="uq_project_milestone_sequence"),
        # Within the same project, title must be unique (cannot have two milestones with identical names)
        UniqueConstraint("project_id", "title", name="uq_project_milestone_title"),
    )