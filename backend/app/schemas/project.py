from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.project import ProjectStatus

# Base schema with shared attributes
class ProjectBase(BaseModel):
    tender_id: str = Field(..., max_length=64, description="Official unique tender or sanction ID")
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    sector: str = Field(..., example="Roads & Highways")
    allocated_budget: float = Field(..., gt=0, description="Budget in INR, must be positive")
    status: ProjectStatus = ProjectStatus.PLANNED
    state: str = Field(..., example="Maharashtra")
    district: str = Field(..., example="Pune")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    start_date: Optional[datetime] = None
    target_completion_date: Optional[datetime] = None

# Schema used when creating a new project via POST
class ProjectCreate(ProjectBase):
    pass

# Schema used for updating an existing project via PUT/PATCH
class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    allocated_budget: Optional[float] = Field(None, gt=0)
    expenditure_to_date: Optional[float] = Field(None, ge=0)
    physical_progress_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    target_completion_date: Optional[datetime] = None

# Schema returned to the client (includes DB-generated fields like id and timestamps)
class ProjectResponse(ProjectBase):
    id: int
    expenditure_to_date: float
    physical_progress_pct: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy ORM objects directly
