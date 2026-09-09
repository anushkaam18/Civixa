"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import {
  fetchProjectById,
  fetchProjectMilestones,
  fetchProjectHistory,
  BackendProject,
  BackendMilestone,
  AuditHistoryRecord,
} from "@/app/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://129.159.238.173:8000";

// Helper to clean enum strings and format currencies
function formatAuditValue(fieldName: string, val: string | null | undefined): string {
  if (!val) return "";

  // 1. Strip enum prefixes like ProjectStatus.TENDERING -> TENDERING
  let clean = val
    .replace(/^ProjectStatus\./i, "")
    .replace(/^MilestoneStatus\./i, "")
    .trim();

  // 2. Format huge numbers (e.g. 18400000000.0 -> ₹1,840 Cr)
  const num = parseFloat(clean);
  if (
    (fieldName.toLowerCase().includes("budget") ||
      fieldName.toLowerCase().includes("expenditure")) &&
    !isNaN(num) &&
    num >= 10000000
  ) {
    return `₹${(num / 10000000).toLocaleString("en-IN", {
      maximumFractionDigits: 1,
    })} Cr`;
  }

  return clean;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<BackendProject | null>(null);
  const [milestones, setMilestones] = useState<BackendMilestone[]>([]);
  const [history, setHistory] = useState<AuditHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Edit Project Form Data
  const [editFormData, setEditFormData] = useState({
    title: "",
    status: "PLANNED",
    allocated_budget: "",
    change_reason: "",
    changed_by: "Chief Project Engineer",
  });

  // Milestone Form Data
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: "",
    sequence_order: 1,
    target_budget: "",
    weight_percentage: 25,
    status: "IN_PROGRESS",
  });

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projData, msData, histData] = await Promise.all([
        fetchProjectById(id),
        fetchProjectMilestones(id),
        fetchProjectHistory(id),
      ]);
      setProject(projData);
      setMilestones(msData || []);
      setHistory(histData || []);

      if (projData) {
        setEditFormData({
          title: projData.title,
          status: projData.status,
          allocated_budget: String(projData.allocated_budget),
          change_reason: "",
          changed_by: "District Project Engineer",
        });
      }
    } catch (err) {
      console.error("Failed to load project dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Submit Project Revision (Audit Log Trigger)
  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setActionLoading(true);

    try {
      const payload = {
        title: editFormData.title.trim(),
        status: editFormData.status,
        allocated_budget: parseFloat(editFormData.allocated_budget),
        change_reason: editFormData.change_reason.trim() || "Baseline parameters revision",
        changed_by: editFormData.changed_by.trim() || "Executive Director",
      };

      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to revise project");

      setIsEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to update project");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit New Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setActionLoading(true);

    try {
      const payload = {
        title: milestoneFormData.title.trim(),
        sequence_order: Number(milestoneFormData.sequence_order),
        target_budget: parseFloat(milestoneFormData.target_budget) || 0,
        weight_percentage: parseFloat(String(milestoneFormData.weight_percentage)),
        status: milestoneFormData.status,
      };

      const res = await fetch(`${API_BASE}/projects/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create milestone");

      setMilestoneFormData({
        title: "",
        sequence_order: milestones.length + 2,
        target_budget: "",
        weight_percentage: 20,
        status: "PENDING",
      });
      setIsMilestoneModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to add milestone");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-[#f4f5f2] flex">
        <Sidebar />
        <section className="min-h-screen flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mb-3" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Loading Dossier #{id}...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen w-full bg-[#f4f5f2] flex">
        <Sidebar />
        <section className="min-h-screen flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md w-full border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-bold text-slate-950">Project Not Found</h2>
            <p className="mt-2 text-xs text-slate-500">
              No record for Project #{id} in the database.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-block border border-slate-950 bg-slate-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
            >
              ← Return to Projects
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const budgetCr = (project.allocated_budget / 10000000).toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  });
  const spentCr = (project.expenditure_to_date / 10000000).toLocaleString("en-IN", {
    maximumFractionDigits: 1,
  });

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2] flex">
      <Sidebar />

      <section className="min-h-screen flex-1 bg-[#f4f5f2]">
        {/* HEADER */}
        <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex min-w-0 flex-col gap-4">
            <Link
              href="/projects"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
            >
              ← Back to Projects
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  CIVIXA · DOSSIER · {project.tender_id}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                  {project.title}
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Sector: <span className="font-semibold text-slate-700">{project.sector}</span> · 
                  Location: <span className="font-semibold text-slate-700">{project.district ? `${project.district}, ` : ""}{project.state}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                    project.status === "DELAYED" || project.status === "HALTED"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : project.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {project.status.replace("_", " ")}
                </span>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  ✎ Revise Baseline
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="w-full min-w-0 px-5 py-7 sm:px-8 lg:px-10 space-y-7">
          {/* KPI ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sanctioned Budget
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">₹{budgetCr} Cr</p>
              <p className="mt-1 text-xs text-slate-500">Total authorized capital</p>
            </div>

            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Expenditure to Date
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">₹{spentCr} Cr</p>
              <p className="mt-1 text-xs text-slate-500">
                {project.allocated_budget > 0
                  ? `${((project.expenditure_to_date / project.allocated_budget) * 100).toFixed(1)}% utilized`
                  : "0.0% utilized"}
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Physical Progress
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {project.physical_progress_pct}%
              </p>
              <div className="mt-2 h-1.5 w-full bg-slate-100">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{ width: `${Math.min(100, project.physical_progress_pct)}%` }}
                />
              </div>
            </div>

            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GIS Coordinates
              </p>
              <p className="mt-2 text-sm font-mono font-medium text-slate-800">
                {project.latitude && project.longitude
                  ? `${project.latitude.toFixed(4)}°N, ${project.longitude.toFixed(4)}°E`
                  : "Not geo-tagged"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Site surveillance coordinates</p>
            </div>
          </div>

          {/* TWO COLUMN SECTION: MILESTONES & AUDIT HISTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {/* MILESTONES (2 COLS) */}
            <div className="lg:col-span-2 border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Execution Schedule
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-slate-950">
                    Work Breakdown Structure & Milestones
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    {milestones.length} Defined Phases
                  </span>
                  <button
                    onClick={() => {
                      setMilestoneFormData({
                        title: "",
                        sequence_order: milestones.length + 1,
                        target_budget: "",
                        weight_percentage: 20,
                        status: "IN_PROGRESS",
                      });
                      setIsMilestoneModalOpen(true);
                    }}
                    className="border border-slate-900 bg-slate-950 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-slate-800 cursor-pointer"
                  >
                    + Add Phase
                  </button>
                </div>
              </div>

              <div className="p-6">
                {milestones.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {milestones.map((m) => (
                      <div
                        key={m.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                            {m.sequence_order}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {m.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Weight: <span className="font-semibold text-slate-700">{m.weight_percentage}%</span> · 
                              Target Budget: ₹{(m.target_budget / 10000000).toFixed(1)} Cr · 
                              Spent: ₹{(m.actual_expenditure / 10000000).toFixed(1)} Cr
                            </p>
                          </div>
                        </div>

                        <span
                          className={`self-start sm:self-auto px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                            m.status === "ACHIEVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : m.status === "DELAYED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <p className="font-semibold text-slate-800">No Phases Defined Yet</p>
                    <p className="mt-1 text-slate-400">
                      Click "+ Add Phase" to insert sequential work breakdown milestones.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AUDIT LEDGER (1 COL) */}
            <div className="border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Institutional Memory
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-slate-950">
                  Audit Ledger
                </h2>
              </div>

              <div className="p-6">
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history
                      // Filter out redundant logs where normalized old == new
                      .filter((h) => {
                        const oldVal = formatAuditValue(h.field_name, h.old_value);
                        const newVal = formatAuditValue(h.field_name, h.new_value);
                        return !h.old_value || oldVal !== newVal;
                      })
                      .map((h) => {
                        const cleanOld = formatAuditValue(h.field_name, h.old_value);
                        const cleanNew = formatAuditValue(h.field_name, h.new_value);

                        return (
                          <div key={h.id} className="border-l-2 border-slate-950 pl-3.5 py-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-bold uppercase tracking-wider text-slate-800">
                                {h.field_name.replace(/_/g, " ")}
                              </span>
                              <span className="font-medium text-slate-400">
                                {new Date(h.timestamp).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-800">
                              {cleanOld && (
                                <span className="line-through text-red-500 mr-2">
                                  {cleanOld}
                                </span>
                              )}
                              <span className="text-emerald-600 font-bold">
                                ➔ {cleanNew}
                              </span>
                            </p>

                            {h.change_reason && (
                              <p className="mt-1.5 text-[11px] italic text-slate-600 bg-slate-50 p-2 border border-slate-100">
                                "{h.change_reason}"
                              </p>
                            )}

                            {h.changed_by && (
                              <p className="mt-1 text-[10px] text-slate-400 font-mono">
                                By: {h.changed_by}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <p className="font-semibold text-slate-800">Baseline Maintained</p>
                    <p className="mt-1 text-slate-400">
                      Zero revisions or unauthorized cost escalations detected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVISE BASELINE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Institutional Revision
                </p>
                <h3 className="text-lg font-bold text-slate-950">Revise Project Parameters</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-3 border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEditProject} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="TENDERING">Tendering</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="HALTED">Halted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Allocated Budget (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editFormData.allocated_budget}
                    onChange={(e) => setEditFormData({ ...editFormData, allocated_budget: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Justification Reason * (Enters Immutable Audit Trail)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Scope enlargement due to revised structural design at chainage 45km..."
                  value={editFormData.change_reason}
                  onChange={(e) => setEditFormData({ ...editFormData, change_reason: e.target.value })}
                  className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Authorized Officer
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.changed_by}
                  onChange={(e) => setEditFormData({ ...editFormData, changed_by: e.target.value })}
                  className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="border border-slate-950 bg-slate-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {actionLoading ? "Writing to Audit Ledger..." : "Commit Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MILESTONE MODAL */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Execution Milestone
                </p>
                <h3 className="text-lg font-bold text-slate-950">Add Work Breakdown Phase</h3>
              </div>
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-3 border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddMilestone} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phase Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drainage & Sub-grade Compaction"
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                  className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={milestoneFormData.sequence_order}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, sequence_order: Number(e.target.value) })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Weight (% towards total)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={milestoneFormData.weight_percentage}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, weight_percentage: parseFloat(e.target.value) })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Target Budget (₹ INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000000"
                    value={milestoneFormData.target_budget}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, target_budget: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={milestoneFormData.status}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, status: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ACHIEVED">Achieved</option>
                    <option value="DELAYED">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="border border-slate-950 bg-slate-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {actionLoading ? "Saving Phase..." : "Add Phase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
