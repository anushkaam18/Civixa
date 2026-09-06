from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from app.models.agency import AgencyType

class AgencyBase(BaseModel):
    registration_no: str = Field(..., max_length=64, example="GSTIN27AABCL1234F1Z5")
    name: str = Field(..., min_length=2, max_length=255, example="Larsen & Toubro Infrastructure")
    agency_type: AgencyType = AgencyType.PRIVATE_CONTRACTOR
    contact_person: Optional[str] = Field(None, example="Rajesh Kulkarni")
    email: EmailStr = Field(..., example="infrastructure@larsentoubro.com")
    phone: Optional[str] = Field(None, example="+91-9820011223")
    address: Optional[str] = Field(None, example="L&T House, Ballard Estate, Mumbai")
    rating: Optional[float] = Field(3.5, ge=1.0, le=5.0, description="1.0 to 5.0 performance rating")

class AgencyCreate(AgencyBase):
    pass

class AgencyUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    projects_completed: Optional[int] = Field(None, ge=0)
    blacklisted: Optional[int] = Field(None, ge=0, le=1)

class AgencyResponse(AgencyBase):
    id: int
    projects_completed: int
    blacklisted: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True