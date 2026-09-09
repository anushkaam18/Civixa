/*
  CIVIXA — Backend Adapter Layer
  --------------------------------------------------------------
  This file is the ONLY place that should know what the real
  FastAPI backend's data looks like. Every page/component keeps
  using the same "UI shapes" it already uses today (id, name,
  location, progress, status, risk, etc). This file is responsible
  for fetching from the backend and translating its shape into
  the UI shape, so pages don't need to be rewritten later if the
  backend changes again.

  HOW TO USE
  --------------------------------------------------------------
  Set the backend URL in `.env.local`:

    NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

  Then in a page/component:

    import { fetchProjects, fetchProjectSummary } from "@/app/lib/api";

    const projects = await fetchProjects();
    const summary = await fetchProjectSummary();

  KNOWN GAPS (as of the Module 1 spec you were given)
  --------------------------------------------------------------
  - The backend has NO concept of "risk". Risk badges are a
    frontend-only idea right now. `deriveRiskLevel()` below is a
    placeholder heuristic based only on schedule + cost variance
    (the two signals the backend can actually give us). It is NOT
    the same predictive model as `/api/predictive` and should be
    treated as provisional until:
      (a) citizen complaints data exists, and
      (b) failed inspection data exists.
  - There is no `/alerts` resource on the backend. Alerts stay a
    Next.js-only feature (`/api/alerts`) for now.
  - There is no auth wired up here yet. If the backend requires a
    Bearer token, `apiFetch()` is the one place to add the header
    once login exists.
*/

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

/* ============================================================
   RAW BACKEND TYPES
   (mirrors backend/app/models + module-1-full-endpoints.md
   — do not reuse these outside this file)
   ============================================================ */

export type BackendProjectStatus =
  | "PLANNED"
  | "TENDERING"
  | "IN_PROGRESS"
  | "DELAYED"
  | "COMPLETED"
  | "HALTED";

export type BackendMilestoneStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "ACHIEVED"
  | "DELAYED"
  | "BLOCKED";

export type BackendProject = {
  id: number;
  tender_id: string;
  title: string;
  description?: string | null;
  sector: string;
  allocated_budget: number;
  expenditure_to_date: number;
  status: BackendProjectStatus;
  physical_progress_pct: number;
  state: string;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
  start_date?: string | null;
  target_completion_date?: string | null;
  actual_completion_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type BackendMilestone = {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  sequence_order: number;
  target_budget: number;
  actual_expenditure: number;
  weight_percentage: number;
  status: BackendMilestoneStatus;
  due_date?: string | null;
  achieved_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type BackendProjectSummaryStats = {
  total_projects: number;
  total_allocated_budget: number;
  total_expenditure: number;
  overall_average_progress_pct: number;
  status_breakdown: Record<BackendProjectStatus, number>;
};

/* ============================================================
   UI-FACING TYPES
   (this is the shape your pages already expect — see
   app/lib/projects.ts and app/projects/page.tsx)
   ============================================================ */

export type UIProjectStatus = "On Track" | "Delayed" | "Completed" | "Planned" | "Halted";
export type UIRiskLevel = "Low risk" | "Watchlist" | "High risk";

export type UIProject = {
  id: string; // tender_id — used for routing/display, e.g. "MORTH-NH44-2026-001"
  backendId: number; // numeric primary key, needed for PATCH/DELETE calls
  name: string;
  location: string; // "district, state"
  sector: string;
  progress: number; // 0-100
  status: UIProjectStatus;
  risk: UIRiskLevel;
  expenditure: number; // in Cr, rounded, for display
  allocatedBudget: number; // in Cr, rounded
  latitude?: number | null;
  longitude?: number | null;
  startDate?: string | null;
  targetCompletionDate?: string | null;
};

export type UIProjectSummary = {
  totalProjects: number;
  totalAllocatedBudgetCr: number;
  totalExpenditureCr: number;
  averageProgressPct: number;
  statusBreakdown: Record<BackendProjectStatus, number>;
};

/* ============================================================
   RESULT WRAPPER
   Every function below returns this shape so pages can handle
   loading/error state the same way they already do for
   /api/predictive and /api/alerts.
   ============================================================ */

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ============================================================
   LOW-LEVEL FETCH HELPER
   ============================================================ */

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // TODO: once /auth/login exists, attach:
        // Authorization: `Bearer ${token}`,
      },
      ...init,
    });

    if (!response.ok) {
      let detail = `Request failed with status ${response.status}`;

      try {
        const body = await response.json();
        if (body?.detail) detail = body.detail;
      } catch {
        // response wasn't JSON — keep the generic message
      }

      return { success: false, error: detail };
    }

    const data = (await response.json()) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? `Could not reach backend: ${error.message}`
          : "Could not reach backend.",
    };
  }
}

/* ============================================================
   MAPPING HELPERS
   ============================================================ */

function mapStatus(status: BackendProjectStatus): UIProjectStatus {
  switch (status) {
    case "IN_PROGRESS":
      return "On Track";
    case "DELAYED":
    case "HALTED":
      return "Delayed";
    case "COMPLETED":
      return "Completed";
    case "PLANNED":
    case "TENDERING":
      return "Planned";
    default:
      return "Planned";
  }
}

function toCrore(rupees: number): number {
  // 1 Crore = 10,000,000 rupees
  return Math.round((rupees / 10_000_000) * 100) / 100;
}

/*
  Placeholder risk heuristic.

  Only uses schedule variance (how overdue milestones are) and
  cost variance (spend vs. allocated budget), because complaints
  and failed-inspection data don't exist on the backend yet.

  This intentionally mirrors the WEIGHTING STYLE of
  /api/predictive but is NOT the same model — treat any risk
  label produced here as provisional.
*/
function deriveRiskLevel(project: BackendProject): UIRiskLevel {
  const costVariancePct =
    project.allocated_budget > 0
      ? ((project.expenditure_to_date - project.allocated_budget) /
          project.allocated_budget) *
        100
      : 0;

  const isBehindSchedule =
    project.status === "DELAYED" || project.status === "HALTED";

  if (isBehindSchedule && costVariancePct > 10) return "High risk";
  if (isBehindSchedule || costVariancePct > 10) return "Watchlist";
  return "Low risk";
}

function mapProject(project: BackendProject): UIProject {
  return {
    id: project.tender_id,
    backendId: project.id,
    name: project.title,
    location: `${project.district}, ${project.state}`,
    sector: project.sector,
    progress: Math.round(project.physical_progress_pct),
    status: mapStatus(project.status),
    risk: deriveRiskLevel(project),
    expenditure: toCrore(project.expenditure_to_date),
    allocatedBudget: toCrore(project.allocated_budget),
    latitude: project.latitude,
    longitude: project.longitude,
    startDate: project.start_date,
    targetCompletionDate: project.target_completion_date,
  };
}

function mapSummary(stats: BackendProjectSummaryStats): UIProjectSummary {
  return {
    totalProjects: stats.total_projects,
    totalAllocatedBudgetCr: toCrore(stats.total_allocated_budget),
    totalExpenditureCr: toCrore(stats.total_expenditure),
    averageProgressPct: Math.round(stats.overall_average_progress_pct),
    statusBreakdown: stats.status_breakdown,
  };
}

/* ============================================================
   PUBLIC API — PROJECTS
   ============================================================ */

export type ProjectListFilters = {
  skip?: number;
  limit?: number;
  sector?: string;
  status?: BackendProjectStatus;
  state?: string;
  district?: string;
  search?: string;
};

export async function fetchProjects(
  filters: ProjectListFilters = {},
): Promise<ApiResult<UIProject[]>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  const result = await apiFetch<BackendProject[]>(
    `/projects/${query ? `?${query}` : ""}`,
  );

  if (!result.success) return result;
  return { success: true, data: result.data.map(mapProject) };
}

export async function fetchProjectById(
  backendId: number,
): Promise<ApiResult<UIProject>> {
  const result = await apiFetch<BackendProject>(`/projects/${backendId}`);
  if (!result.success) return result;
  return { success: true, data: mapProject(result.data) };
}

export async function fetchProjectSummary(): Promise<
  ApiResult<UIProjectSummary>
> {
  // Try the "real" endpoint first, in case it gets added later.
  const result = await apiFetch<BackendProjectSummaryStats>(
    "/projects/summary/stats",
  );

  if (result.success) {
    return { success: true, data: mapSummary(result.data) };
  }

  /*
    FALLBACK: /projects/summary/stats doesn't exist in the backend yet
    (confirmed against the Module 1 README's "Endpoints Implemented"
    list). Compute the same numbers client-side from the raw project
    list instead, so the dashboard isn't blocked on that endpoint
    being built. Safe to delete this fallback once the real endpoint
    ships — fetchProjectSummary()'s return shape won't change.
  */
  const listResult = await apiFetch<BackendProject[]>("/projects/");

  if (!listResult.success) {
    return { success: false, error: listResult.error };
  }

  const projects = listResult.data;

  const totalAllocatedBudget = projects.reduce(
    (sum, p) => sum + p.allocated_budget,
    0,
  );

  const totalExpenditure = projects.reduce(
    (sum, p) => sum + p.expenditure_to_date,
    0,
  );

  const averageProgress =
    projects.length > 0
      ? projects.reduce((sum, p) => sum + p.physical_progress_pct, 0) /
        projects.length
      : 0;

  const statusBreakdown: Record<BackendProjectStatus, number> = {
    PLANNED: 0,
    TENDERING: 0,
    IN_PROGRESS: 0,
    DELAYED: 0,
    COMPLETED: 0,
    HALTED: 0,
  };

  projects.forEach((p) => {
    statusBreakdown[p.status] = (statusBreakdown[p.status] ?? 0) + 1;
  });

  return {
    success: true,
    data: {
      totalProjects: projects.length,
      totalAllocatedBudgetCr: toCrore(totalAllocatedBudget),
      totalExpenditureCr: toCrore(totalExpenditure),
      averageProgressPct: Math.round(averageProgress),
      statusBreakdown,
    },
  };
}

/* ============================================================
   PUBLIC API — MILESTONES
   (kept in backend shape for now — no page consumes these yet)
   ============================================================ */

export async function fetchProjectMilestones(
  backendProjectId: number,
): Promise<ApiResult<BackendMilestone[]>> {
  return apiFetch<BackendMilestone[]>(
    `/projects/${backendProjectId}/milestones`,
  );
}
