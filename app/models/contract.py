import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ContractType(str, enum.Enum):
    EPC = "EPC"               # Engineering, Procurement & Construction (standard for highways)
    BOT = "BOT"               # Build, Operate, Transfer
    HAM = "HAM"               # Hybrid Annuity Model (NHAI favorite)
    ITEM_RATE = "ITEM_RATE"   # Measurement/Item rate contract
    CONSULTANCY = "CONSULTANCY"

class ContractStatus(str, enum.Enum):
    AWARDED = "AWARDED"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    TERMINATED = "TERMINATED"  # Critical signal for Module 4 AI Risk!
    COMPLETED = "COMPLETED"

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Official Contract / Agreement Number
    contract_number = Column(String(100), unique=True, nullable=False, index=True)
    
    # Foreign Keys linking Project and Agency
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    contract_type = Column(Enum(ContractType), default=ContractType.EPC, nullable=False)
    status = Column(Enum(ContractStatus), default=ContractStatus.AWARDED, nullable=False)
    
    # Financial Terms (INR)
    awarded_amount = Column(Float, nullable=False)
    retention_money_pct = Column(Float, default=5.0) # Security deposit held by government
    
    # Contract Timelines
    signing_date = Column(DateTime(timezone=True), nullable=True)
    commencement_date = Column(DateTime(timezone=True), nullable=True)
    stipulated_completion_date = Column(DateTime(timezone=True), nullable=False)
    actual_completion_date = Column(DateTime(timezone=True), nullable=True)

    # Performance bond & penal clauses
    performance_guarantee_valid_till = Column(DateTime(timezone=True), nullable=True)
    penalties_levied = Column(Float, default=0.0)

    # Modern PostgreSQL server timestamps (no deprecation warnings)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    project = relationship("Project")
    agency = relationship("Agency")

    __table_args__ = (
        # Ensure a contract number is unique
        UniqueConstraint("contract_number", name="uq_contract_number"),
    )