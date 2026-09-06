from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.stats import ProjectSummaryStats

from app.database import get_db
from app.models.project import Project
from app.models.audit import ProjectHistory
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.audit import ProjectHistoryResponse, ProjectUpdateWithReason

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    # Deduplication check: tender_id
    existing = db.query(Project).filter(Project.tender_id == project_in.tender_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project with Tender ID '{project_in.tender_id}' already exists."
        )
    
    db_project = Project(**project_in.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Initial history log entry
    initial_log = ProjectHistory(
        project_id=db_project.id,
        field_name="STATUS",
        old_value=None,
        new_value=str(db_project.status.value),
        reason="Project registered into CIVIXA system",
        changed_by="Registration Portal"
    )
    db.add(initial_log)
    db.commit()

    return db_project

@router.get("/", response_model=List[ProjectResponse])
def list_projects(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Project).offset(skip).limit(limit).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

# PATCH: Updates project AND logs every changed field to project_history!
@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int, 
    project_in: ProjectUpdateWithReason, 
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = project_in.model_dump(exclude_unset=True)
    change_reason = update_data.pop("change_reason", "Routine operational update")
    changed_by = update_data.pop("changed_by", "Project Officer")

    # Detect what actually changed and create audit snapshots
    for field, new_val in update_data.items():
        old_val = getattr(project, field)
        
        # Compare strings to capture enum or datetime transitions
        if str(old_val) != str(new_val) and new_val is not None:
            history_entry = ProjectHistory(
                project_id=project.id,
                field_name=field,
                old_value=str(old_val),
                new_value=str(new_val),
                reason=change_reason,
                changed_by=changed_by
            )
            db.add(history_entry)
            setattr(project, field, new_val)

    db.commit()
    db.refresh(project)
    return project

# Place this ABOVE @router.get("/{project_id}")!
@router.get("/summary/stats", response_model=ProjectSummaryStats)
def get_project_summary_stats(
    sector: str = None,
    state: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if sector:
        query = query.filter(Project.sector == sector)
    if state:
        query = query.filter(Project.state == state)

    projects = query.all()
    total_count = len(projects)

    if total_count == 0:
        return ProjectSummaryStats(
            total_projects=0,
            total_allocated_budget=0.0,
            total_expenditure=0.0,
            overall_average_progress_pct=0.0,
            status_breakdown={}
        )

    total_budget = sum(p.allocated_budget for p in projects)
    total_spent = sum(p.expenditure_to_date for p in projects)
    avg_progress = sum(p.physical_progress_pct for p in projects) / total_count

    # Aggregate count by status (IN_PROGRESS, DELAYED, etc.)
    status_counts = {}
    for p in projects:
        status_key = p.status.value
        status_counts[status_key] = status_counts.get(status_key, 0) + 1

    return ProjectSummaryStats(
        total_projects=total_count,
        total_allocated_budget=total_budget,
        total_expenditure=total_spent,
        overall_average_progress_pct=round(avg_progress, 2),
        status_breakdown=status_counts
    )

# GET: The historical change timeline for a project
@router.get("/{project_id}/history", response_model=List[ProjectHistoryResponse])
def get_project_history(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return (
        db.query(ProjectHistory)
        .filter(ProjectHistory.project_id == project_id)
        .order_by(ProjectHistory.timestamp.desc())
        .all()
    )

