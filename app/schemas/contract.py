from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.contract import ContractType, ContractStatus

class ContractBase(BaseModel):
    contract_number: str = Field(..., max_length=100, example="CA-MORTH-2026-EPC-09")
    project_id: int = Field(..., example=1, description="ID of the project being awarded")
    agency_id: int = Field(..., example=1, description="ID of the contractor executing the project")
    title: str = Field(..., min_length=3, max_length=255, example="Main Carriageway Pavement & Bridges Package")
    contract_type: ContractType = ContractType.EPC
    status: ContractStatus = ContractStatus.AWARDED
    awarded_amount: float = Field(..., gt=0, description="Contract value in INR, must be greater than 0")
    retention_money_pct: Optional[float] = Field(5.0, ge=0.0, le=20.0)
    signing_date: Optional[datetime] = None
    commencement_date: Optional[datetime] = None
    stipulated_completion_date: datetime

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[ContractStatus] = None
    awarded_amount: Optional[float] = Field(None, gt=0)
    stipulated_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None
    penalties_levied: Optional[float] = Field(None, ge=0)

class ContractResponse(ContractBase):
    id: int
    penalties_levied: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True