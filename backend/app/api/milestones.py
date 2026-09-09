from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.milestone import Milestone, MilestoneStatus
from app.schemas.milestone import MilestoneCreate, MilestoneResponse, MilestoneUpdate

router = APIRouter(tags=["Milestones"])

# Helper function to recalculate parent project progress & expenditure
def rollup_project_metrics(project_id: int, db: Session):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return

    milestones = db.query(Milestone).filter(Milestone.project_id == project_id).all()
    
    total_expenditure = sum(m.actual_expenditure for m in milestones)
    completed_progress = sum(
        m.weight_percentage for m in milestones if m.status == MilestoneStatus.ACHIEVED
    )

    project.expenditure_to_date = total_expenditure
    project.physical_progress_pct = min(completed_progress, 100.0)
    db.commit()

# 1. Add a new milestone to a specific project
@router.post("/projects/{project_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def create_milestone_for_project(project_id: int, milestone_in: MilestoneCreate, db: Session = Depends(get_db)):
    # Verify parent project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db_milestone = Milestone(**milestone_in.model_dump(), project_id=project_id)
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

# 2. Get all milestones belonging to a project
@router.get("/projects/{project_id}/milestones", response_model=List[MilestoneResponse])
def get_project_milestones(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    return db.query(Milestone).filter(Milestone.project_id == project_id).order_by(Milestone.sequence_order).all()

# 3. Update a milestone (e.g. mark achieved, log actual expenditure)
@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(milestone_id: int, milestone_in: MilestoneUpdate, db: Session = Depends(get_db)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    update_data = milestone_in.model_dump(exclude_unset=True)
    
    # If marking as ACHIEVED and achieved_date wasn't explicitly given, auto-set now
    if update_data.get("status") == MilestoneStatus.ACHIEVED and not update_data.get("achieved_date"):
        update_data["achieved_date"] = datetime.utcnow()

    for key, value in update_data.items():
        setattr(milestone, key, value)

    db.commit()
    db.refresh(milestone)

    # Auto-recalculate project physical progress % and expenditure!
    rollup_project_metrics(milestone.project_id, db)

    return milestone
