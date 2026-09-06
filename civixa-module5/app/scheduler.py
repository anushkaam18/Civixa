import os
from apscheduler.schedulers.background import BackgroundScheduler

from .database import SessionLocal
from . import models
from .services.pdf_generator import generate_alert_report

scheduler = BackgroundScheduler()


def scheduled_report_job():
    """Runs automatically and generates a PDF snapshot of open alerts."""
    db = SessionLocal()
    try:
        alerts = db.query(models.Alert).filter(models.Alert.status == "open").all()
        filepath = generate_alert_report(alerts)
        history = models.ReportHistory(
            report_name=os.path.basename(filepath),
            file_path=filepath,
        )
        db.add(history)
        db.commit()
        print(f"[scheduler] Scheduled report generated: {filepath}")
    finally:
        db.close()


def start_scheduler():
    # Runs every day at 9 AM.
    # For quick testing, comment this out and use the line below instead:
    # scheduler.add_job(scheduled_report_job, "interval", minutes=2, id="daily_report")
    scheduler.add_job(scheduled_report_job, "cron", hour=9, minute=0, id="daily_report")
    scheduler.start()
