from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ProjectHistoryResponse(BaseModel):
    id: int
    project_id: int
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    changed_by: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Schema for when an officer provides a reason along with an update
class ProjectUpdateWithReason(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    allocated_budget: Optional[float] = None
    target_completion_date: Optional[datetime] = None
    # Audit trail metadata
    change_reason: Optional[str] = "Routine milestone/timeline review"
    changed_by: Optional[str] = "District Project Engineer"