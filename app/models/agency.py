import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from sqlalchemy.sql import func
from app.database import Base

class AgencyType(str, enum.Enum):
    PUBLIC_SECTOR = "PUBLIC_SECTOR"
    PRIVATE_CONTRACTOR = "PRIVATE_CONTRACTOR"
    CONSULTANT = "CONSULTANT"
    JOINT_VENTURE = "JOINT_VENTURE"

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)
    registration_no = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    agency_type = Column(Enum(AgencyType), default=AgencyType.PRIVATE_CONTRACTOR, nullable=False)
    
    contact_person = Column(String(100), nullable=True)
    email = Column(String(150), nullable=False, unique=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    
    rating = Column(Float, default=3.5)
    projects_completed = Column(Integer, default=0)
    blacklisted = Column(Integer, default=0)

    # Modern, non-deprecated PostgreSQL server timestamp:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)