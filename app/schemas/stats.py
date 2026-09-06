from typing import Dict
from pydantic import BaseModel

class ProjectSummaryStats(BaseModel):
    total_projects: int
    total_allocated_budget: float
    total_expenditure: float
    overall_average_progress_pct: float
    status_breakdown: Dict[str, int]