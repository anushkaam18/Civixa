"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { fetchProjects, BackendProject } from "@/app/lib/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://129.159.238.173:8000";

const SECTORS = [
  "All",
  "Roads & Highways",
  "Railways & Metro",
  "Water Resources",
  "Power & Energy",
  "Urban Development",
];

const STATUSES = [
  "All",
  "PLANNED",
  "TENDERING",
  "IN_PROGRESS",
  "DELAYED",
  "COMPLETED",
  "HALTED",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tender_id: "",
    title: "",
    sector: "Roads & Highways",
    allocated_budget: "",
    status: "PLANNED",
    state: "",
    district: "",
    latitude: "",
    longitude: "",
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects(
        selectedSector !== "All" ? selectedSector : undefined,
        selectedStatus !== "All" ? selectedStatus : undefined
      );
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedSector, selectedStatus]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        tender_id: formData.tender_id.trim(),
        title: formData.title.trim(),
        sector: formData.sector,
        allocated_budget: parseFloat(formData.allocated_budget),
        status: formData.status,
        state: formData.state.trim(),
        district: formData.district.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      if (!payload.tender_id || !payload.title || isNaN(payload.allocated_budget) || !payload.state) {
        throw new Error("Please complete all required fields (Tender ID, Title, Budget, State).");
      }

      const res = await fetch(`${API_BASE}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorDetail = await res.json().catch(() => ({}));
        throw new Error(
          errorDetail.detail?.[0]?.msg ||
            errorDetail.detail ||
            `Failed to register project (HTTP ${res.status})`
        );
      }

      setFormData({
        tender_id: "",
        title: "",
        sector: "Roads & Highways",
        allocated_budget: "",
        status: "PLANNED",
        state: "",
        district: "",
        latitude: "",
        longitude: "",
      });
      setIsModalOpen(false);
      await loadProjects();
    } catch (err: any) {
      setFormError(err.message || "Network error when attempting to fetch resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tender_id.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      (p.district && p.district.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2]">
      <Sidebar />

      <section className="min-h-screen w-full bg-[#f4f5f2]">
        {/* HEADER */}
        <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                CIVIXA · PROJECT PORTFOLIO
              </p>
              <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">
                Projects
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Browse and compare infrastructure projects, implementation progress, expenditure and delivery status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="group w-full shrink-0 border border-slate-900 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 sm:w-auto cursor-pointer"
            >
              <span className="mr-2 text-base transition-transform duration-200 group-hover:rotate-90 inline-block">
                +
              </span>
              Add Project
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="w-full min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {/* SEARCH & FILTERS */}
          <div className="w-full border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Project directory
                </p>
                <h2 className="text-lg font-semibold text-slate-950">
                  Infrastructure Projects
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Showing {filteredProjects.length} of {projects.length}
              </span>
            </div>

            <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Search projects
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by tender ID, title, state, district..."
                    className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Sector
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-900"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-900"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* PROJECT LISTING */}
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Loading projects from Oracle Database...
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredProjects.map((p) => {
                  const budgetCr = (p.allocated_budget / 10000000).toLocaleString("en-IN", {
                    maximumFractionDigits: 1,
                  });
                  const spentCr = (p.expenditure_to_date / 10000000).toLocaleString("en-IN", {
                    maximumFractionDigits: 1,
                  });

                  return (
                    <div
                      key={p.id}
                      className="px-5 py-6 transition hover:bg-slate-50 sm:px-6"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="break-words text-base font-semibold text-slate-950">
                              {p.title}
                            </h3>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                p.status === "DELAYED" || p.status === "HALTED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : p.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              {p.status.replace("_", " ")}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {p.district ? `${p.district}, ` : ""}{p.state} · {p.sector} · <span className="font-mono">{p.tender_id}</span>
                          </p>

                          <div className="mt-5 w-full max-w-2xl">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                                Implementation progress
                              </span>
                              <span className="text-xs font-medium text-slate-700">
                                {p.physical_progress_pct}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100">
                              <div
                                className="h-full bg-slate-900 transition-all"
                                style={{ width: `${Math.min(100, p.physical_progress_pct)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-2 gap-5 border-t border-slate-100 pt-4 sm:grid-cols-3 lg:min-w-[420px] lg:border-t-0 lg:pt-0">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Allocated Budget
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-900">
                              ₹{budgetCr} Cr
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Expenditure
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-900">
                              ₹{spentCr} Cr
                            </p>
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <Link
                              href={`/projects/${p.id}`}
                              className="inline-flex w-full items-center justify-center border border-slate-300 px-4 py-2 text-xs font-medium text-slate-800 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white sm:w-auto"
                            >
                              Dossier →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-16 text-center sm:px-6">
                <p className="text-sm font-medium text-slate-800">
                  No projects recorded
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Click "+ Add Project" to register a new government sanction.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Government Sanction Registry
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">Register New Project</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Tender ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NHAI-WB-2026-003"
                    value={formData.tender_id}
                    onChange={(e) => setFormData({ ...formData, tender_id: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Sector *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {SECTORS.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Laning of Kolkata-Asansol NH-19 Section"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Allocated Budget (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 24500000000"
                    value={formData.allocated_budget}
                    onChange={(e) => setFormData({ ...formData, allocated_budget: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="TENDERING">Tendering</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DELAYED">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Bengal"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Purba Bardhaman"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Latitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 23.2324"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Longitude (GPS)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 87.8615"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full border border-slate-200 bg-[#fbfbfa] px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="border border-slate-950 bg-slate-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving to Database..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
