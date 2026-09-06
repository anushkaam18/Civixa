"""
Rule Engine — Module 5 core logic.
Takes project metrics (from Module 1's project data and Module 4's
ML risk score) and decides which alerts should fire.

Thresholds are simple constants for now; tune them once real data
starts flowing in from the other modules.
"""

COST_OVERRUN_THRESHOLD = 10.0      # percent
SCHEDULE_DELAY_THRESHOLD = 15      # days
RISK_SCORE_THRESHOLD = 70.0        # out of 100


def evaluate_project(data: dict) -> list:
    """
    data expects keys:
      project_id, project_name,
      cost_overrun_percent, schedule_delay_days, risk_score

    Returns a list of alert dicts ready to insert into the DB.
    """
    alerts = []
    project_id = data["project_id"]
    project_name = data["project_name"]

    cost_overrun = data.get("cost_overrun_percent", 0)
    if cost_overrun >= COST_OVERRUN_THRESHOLD:
        severity = "critical" if cost_overrun >= 25 else "high"
        alerts.append({
            "project_id": project_id,
            "project_name": project_name,
            "alert_type": "cost_overrun",
            "severity": severity,
            "message": (
                f"Cost overrun of {cost_overrun}% detected "
                f"(threshold {COST_OVERRUN_THRESHOLD}%)."
            ),
        })

    delay = data.get("schedule_delay_days", 0)
    if delay >= SCHEDULE_DELAY_THRESHOLD:
        severity = "critical" if delay >= 30 else "medium"
        alerts.append({
            "project_id": project_id,
            "project_name": project_name,
            "alert_type": "schedule_delay",
            "severity": severity,
            "message": (
                f"Schedule delay of {delay} days detected "
                f"(threshold {SCHEDULE_DELAY_THRESHOLD} days)."
            ),
        })

    risk = data.get("risk_score", 0)
    if risk >= RISK_SCORE_THRESHOLD:
        severity = "critical" if risk >= 90 else "high"
        alerts.append({
            "project_id": project_id,
            "project_name": project_name,
            "alert_type": "risk_score",
            "severity": severity,
            "message": (
                f"High ML-predicted risk score: {risk}/100 "
                f"(threshold {RISK_SCORE_THRESHOLD})."
            ),
        })

    return alerts
