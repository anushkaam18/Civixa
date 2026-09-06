import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

REPORTS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "generated_reports"
)
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_alert_report(alerts: list) -> str:
    """
    alerts: list of Alert ORM objects.
    Returns the file path of the generated PDF.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"alert_report_{timestamp}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    doc = SimpleDocTemplate(filepath, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("CIVIXA — Alert &amp; Risk Report", styles["Title"]))
    elements.append(
        Paragraph(
            f"Generated: {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
            styles["Normal"],
        )
    )
    elements.append(Spacer(1, 20))

    if not alerts:
        elements.append(Paragraph("No active alerts at this time.", styles["Normal"]))
    else:
        table_data = [["Project", "Type", "Severity", "Message", "Created"]]
        for a in alerts:
            table_data.append([
                a.project_name,
                a.alert_type,
                a.severity.upper(),
                a.message,
                a.created_at.strftime("%d-%m-%Y %H:%M") if a.created_at else "",
            ])

        table = Table(table_data, repeatRows=1, colWidths=[80, 70, 60, 200, 80])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a2a4a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        elements.append(table)

    doc.build(elements)
    return filepath
