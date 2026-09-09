// app/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://129.159.238.173:8000";

// 1. Data Type Interfaces
export interface BackendProject {
  id: number;
  tender_id: string;
  title: string;
  description?: string;
  sector: string;
  status: "PLANNED" | "TENDERING" | "IN_PROGRESS" | "DELAYED" | "COMPLETED" | "HALTED";
  allocated_budget: number;
  expenditure_to_date: number;
  physical_progress_pct: number;
  state: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  start_date?: string;
  target_completion_date?: string;
}

export interface BackendMilestone {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  sequence_order: number;
  target_budget: number;
  actual_expenditure: number;
  weight_percentage: number;
  status: "PENDING" | "IN_PROGRESS" | "ACHIEVED" | "DELAYED";
  due_date?: string;
}

export interface AuditHistoryRecord {
  id: number;
  project_id: number;
  field_name: string;
  old_value: string;
  new_value: string;
  change_reason?: string;
  changed_by?: string;
  timestamp: string;
}

export interface ExecutiveStats {
  total_projects: number;
  total_allocated_budget: number;
  total_expenditure: number;
  overall_average_progress_pct: number;
  status_breakdown: Record<string, number>;
}

// 2. Network Functions

// Fetch all projects with optional sector/status filters
export async function fetchProjects(sector?: string, status?: string): Promise<BackendProject[]> {
  const params = new URLSearchParams();
  if (sector && sector !== "All") params.append("sector", sector);
  if (status && status !== "All") params.append("status", status.toUpperCase());

  const res = await fetch(`${API_BASE}/projects/?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects from backend");
  return res.json();
}

// Fetch single project by its primary key ID
export async function fetchProjectById(id: string | number): Promise<BackendProject> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Project #${id} not found`);
  return res.json();
}

// Fetch milestones for a project
export async function fetchProjectMilestones(projectId: string | number): Promise<BackendMilestone[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/milestones`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Fetch civic memory audit history
export async function fetchProjectHistory(projectId: string | number): Promise<AuditHistoryRecord[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/history`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Fetch real-time executive dashboard KPIs
export async function fetchExecutiveStats(): Promise<ExecutiveStats> {
  const res = await fetch(`${API_BASE}/projects/summary/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch executive stats");
  return res.json();
}