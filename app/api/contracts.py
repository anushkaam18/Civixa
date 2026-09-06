from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.agency import Agency
from app.models.contract import Contract
from app.schemas.contract import ContractCreate, ContractResponse, ContractUpdate

router = APIRouter(prefix="/contracts", tags=["Contracts & Tender Awards"])

# 1. Award a new contract
@router.post("/", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
def award_contract(contract_in: ContractCreate, db: Session = Depends(get_db)):
    # Verify contract_number is unique
    if db.query(Contract).filter(Contract.contract_number == contract_in.contract_number).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contract number '{contract_in.contract_number}' already registered."
        )

    # Verify parent Project exists
    project = db.query(Project).filter(Project.id == contract_in.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project with ID {contract_in.project_id} does not exist.")

    # Verify Agency exists and is NOT blacklisted
    agency = db.query(Agency).filter(Agency.id == contract_in.agency_id).first()
    if not agency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agency with ID {contract_in.agency_id} does not exist.")
    
    if agency.blacklisted == 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contract cannot be awarded to '{agency.name}' because this agency is blacklisted."
        )

    db_contract = Contract(**contract_in.model_dump())
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

# 2. List all contracts
@router.get("/", response_model=List[ContractResponse])
def list_contracts(project_id: int = None, agency_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Contract)
    if project_id:
        query = query.filter(Contract.project_id == project_id)
    if agency_id:
        query = query.filter(Contract.agency_id == agency_id)
    return query.all()

# 3. Get single contract by ID
@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
    return contract

# 4. Update contract status (e.g. levy penalties, mark complete, terminate)
@router.patch("/{contract_id}", response_model=ContractResponse)
def update_contract(contract_id: int, contract_in: ContractUpdate, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")

    update_data = contract_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contract, key, value)

    db.commit()
    db.refresh(contract)
    return contract