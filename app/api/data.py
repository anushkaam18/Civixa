import csv
import io
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.models.audit import ProjectHistory

router = APIRouter(prefix="/data", tags=["Bulk Data & Reports"])

# 1. Download a blank CSV template for data entry
@router.get("/template/csv")
def download_csv_template():
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers expected by the import engine
    headers = [
        "tender_id",
        "title",
        "description",
        "sector",
        "allocated_budget",
        "status",
        "state",
        "district",
        "latitude",
        "longitude"
    ]
    writer.writerow(headers)
    
    # Sample reference row
    writer.writerow([
        "NHAI-EXP-2026-099",
        "Delhi-Dehradun Economic Corridor Package 2",
        "Access-controlled 6-lane highway passing through wildlife corridor",
        "Roads & Highways",
        "18500000000.0",
        "IN_PROGRESS",
        "Uttarakhand",
        "Dehradun",
        "30.3165",
        "78.0322"
    ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=civixa_project_import_template.csv"}
    )

# 2. Bulk Upload projects from a CSV file
@router.post("/import/csv", status_code=status.HTTP_201_CREATED)
async def import_projects_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files (.csv) are supported."
        )

    content = await file.read()
    try:
        decoded = content.decode("utf-8-sig")  # utf-8-sig handles Excel's BOM characters cleanly
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File encoding error. Please ensure the CSV is UTF-8 encoded."
        )

    csv_reader = csv.DictReader(io.StringIO(decoded))
    
    required_columns = {"tender_id", "title", "sector", "allocated_budget", "state", "district"}
    if not required_columns.issubset(set(csv_reader.fieldnames or [])):
        missing = required_columns - set(csv_reader.fieldnames or [])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV missing mandatory columns: {list(missing)}"
        )

    imported_count = 0
    skipped_count = 0
    errors = []

    for row_num, row in enumerate(csv_reader, start=2): # start at line 2 (line 1 is header)
        tender_id = row.get("tender_id", "").strip()
        if not tender_id:
            continue

        # Check for duplicate tender_id in the database
        if db.query(Project).filter(Project.tender_id == tender_id).first():
            skipped_count += 1
            errors.append(f"Row {row_num}: Tender ID '{tender_id}' already exists in database.")
            continue

        try:
            budget = float(row.get("allocated_budget", 0))
            if budget <= 0:
                raise ValueError("Budget must be positive")

            # Parse status, default to PLANNED if invalid
            status_str = row.get("status", "PLANNED").strip().upper()
            try:
                project_status = ProjectStatus(status_str)
            except ValueError:
                project_status = ProjectStatus.PLANNED

            lat = float(row.get("latitude")) if row.get("latitude") else None
            lng = float(row.get("longitude")) if row.get("longitude") else None

            db_project = Project(
                tender_id=tender_id,
                title=row.get("title", "").strip(),
                description=row.get("description", "").strip(),
                sector=row.get("sector", "").strip(),
                allocated_budget=budget,
                status=project_status,
                state=row.get("state", "").strip(),
                district=row.get("district", "").strip(),
                latitude=lat,
                longitude=lng
            )
            db.add(db_project)
            db.flush() # Flushes to DB to generate db_project.id

            # Log creation in audit history
            audit = ProjectHistory(
                project_id=db_project.id,
                field_name="STATUS",
                old_value=None,
                new_value=project_status.value,
                reason=f"Bulk imported via CSV file '{file.filename}'",
                changed_by="Bulk Ingestion Engine"
            )
            db.add(audit)
            imported_count += 1

        except Exception as e:
            skipped_count += 1
            errors.append(f"Row {row_num}: Failed to process ({str(e)})")

    db.commit()

    return {
        "message": "CSV ingestion completed successfully",
        "filename": file.filename,
        "successfully_imported": imported_count,
        "skipped_or_failed": skipped_count,
        "warnings_and_errors": errors[:10]  # Show up to 10 feedback warnings
    }

# 3. Export all projects as a downloadable CSV file
@router.get("/export/csv")
def export_projects_to_csv(
    sector: str = None, 
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if sector:
        query = query.filter(Project.sector == sector)
    if status:
        query = query.filter(Project.status == status)

    projects = query.all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write Header
    writer.writerow([
        "ID",
        "Tender ID",
        "Title",
        "Sector",
        "Allocated Budget (INR)",
        "Expenditure to Date (INR)",
        "Physical Progress (%)",
        "Status",
        "State",
        "District",
        "Latitude",
        "Longitude",
        "Created At"
    ])

    # Write Data Rows
    for p in projects:
        writer.writerow([
            p.id,
            p.tender_id,
            p.title,
            p.sector,
            p.allocated_budget,
            p.expenditure_to_date,
            p.physical_progress_pct,
            p.status.value,
            p.state,
            p.district,
            p.latitude,
            p.longitude,
            p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else ""
        ])

    output.seek(0)
    filename = f"civixa_projects_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )