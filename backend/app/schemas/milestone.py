from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.milestone import MilestoneStatus

class MilestoneBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, example="Phase 1: Foundation & Geotechnical Survey")
    description: Optional[str] = None
    sequence_order: int = Field(1, ge=1, description="Order in project workflow")
    target_budget: float = Field(0.0, ge=0, description="Budget allocated for this milestone in INR")
    weight_percentage: float = Field(..., gt=0, le=100.0, description="Weight towards project completion percentage")
    status: MilestoneStatus = MilestoneStatus.PENDING
    due_date: Optional[datetime] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[MilestoneStatus] = None
    target_budget: Optional[float] = Field(None, ge=0)
    actual_expenditure: Optional[float] = Field(None, ge=0)
    weight_percentage: Optional[float] = Field(None, gt=0, le=100.0)
    due_date: Optional[datetime] = None
    achieved_date: Optional[datetime] = None

class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    actual_expenditure: float
    achieved_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

