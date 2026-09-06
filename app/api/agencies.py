from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agency import Agency
from app.schemas.agency import AgencyCreate, AgencyResponse, AgencyUpdate

router = APIRouter(prefix="/agencies", tags=["Agencies & Contractors"])

@router.post("/", response_model=AgencyResponse, status_code=status.HTTP_201_CREATED)
def register_agency(agency_in: AgencyCreate, db: Session = Depends(get_db)):
    # Deduplication 1: Registration / GST number
    if db.query(Agency).filter(Agency.registration_no == agency_in.registration_no).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Agency with registration '{agency_in.registration_no}' already exists."
        )
    
    # Deduplication 2: Email
    if db.query(Agency).filter(Agency.email == agency_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Agency with email '{agency_in.email}' already exists."
        )

    db_agency = Agency(**agency_in.model_dump())
    db.add(db_agency)
    db.commit()
    db.refresh(db_agency)
    return db_agency

@router.get("/", response_model=List[AgencyResponse])
def list_agencies(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Agency).offset(skip).limit(limit).all()

@router.get("/{agency_id}", response_model=AgencyResponse)
def get_agency(agency_id: int, db: Session = Depends(get_db)):
    agency = db.query(Agency).filter(Agency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agency not found")
    return agency

@router.patch("/{agency_id}", response_model=AgencyResponse)
def update_agency(agency_id: int, agency_in: AgencyUpdate, db: Session = Depends(get_db)):
    agency = db.query(Agency).filter(Agency.id == agency_id).first()
    if not agency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agency not found")

    update_data = agency_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agency, key, value)

    db.commit()
    db.refresh(agency)
    return agency