import os
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..services.pdf_generator import generate_alert_report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate")
def generate_report(db: Session = Depends(get_db)):
    alerts = db.query(models.Alert).filter(models.Alert.status == "open").all()
    filepath = generate_alert_report(alerts)

    history = models.ReportHistory(
        report_name=os.path.basename(filepath),
        file_path=filepath,
    )
    db.add(history)
    db.commit()

    return {"message": "Report generated", "filename": os.path.basename(filepath)}


@router.get("/")
def list_reports(db: Session = Depends(get_db)):
    return (
        db.query(models.ReportHistory)
        .order_by(models.ReportHistory.generated_at.desc())
        .all()
    )


@router.get("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = (
        db.query(models.ReportHistory)
        .filter(models.ReportHistory.id == report_id)
        .first()
    )
    if not report:
        return {"error": "Report not found"}
    return FileResponse(
        report.file_path, filename=report.report_name, media_type="application/pdf"
    )
