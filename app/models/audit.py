from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ProjectHistory(Base):
    __tablename__ = "project_history"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)

    # What changed
    field_name = Column(String(100), nullable=False)   # e.g., 'status', 'allocated_budget', 'target_completion_date'
    old_value = Column(Text, nullable=True)            # e.g., 'IN_PROGRESS'
    new_value = Column(Text, nullable=True)            # e.g., 'DELAYED'
    
    # Context behind the change
    reason = Column(Text, nullable=True)               # e.g., 'Monsoon flooding caused structural piling delay'
    changed_by = Column(String(100), default="System") # Name or role of officer who authorized change

    # Immutable timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship back to project
    project = relationship("Project")