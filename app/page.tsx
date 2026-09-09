"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import {
  fetchExecutiveStats,
  fetchProjects,
  BackendProject,
  ExecutiveStats,
} from "@/app/lib/api";

type Alert = {
  id: string;
  status: "Active" | "Resolved";
};

export default function DashboardPage() {
  const [stats, setStats] = useState<ExecutiveStats | null>(null);
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsData, projectsData] = await Promise.all([
          fetchExecutiveStats().catch(() => null),
          fetchProjects().catch(() => []),
        ]);

        if (statsData) setStats(statsData);
        if (projectsData) setProjects(projectsData);

        // Try fetching alerts if available
        try {
          const alertsRes = await fetch("/api/alerts", { cache: "no-store" });
          if (alertsRes.ok) {
            const data = await alertsRes.json();
            const active = (data.alerts || []).filter(
              (a: Alert) => a.status === "Active"
            );
            setActiveAlertCount(active.length);
          }
        } catch {
          setActiveAlertCount(0);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // Filter projects needing attention (Delayed, Halted, or progress < 50%)
  const attentionProjects = projects
    .filter((p) => p.status === "DELAYED" || p.status === "HALTED" || p.physical_progress_pct < 50)
    .slice(0, 4);

  // Financial aggregates
  const totalCostCr = stats
    ? (stats.total_allocated_budget / 10000000).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      })
    : "0";

  const totalExpenditureCr = stats
    ? (stats.total_expenditure / 10000000).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      })
    : "0";

  const totalProjects = stats ? stats.total_projects : projects.length;
  const delayedProjectsCount = stats
    ? (stats.status_breakdown?.DELAYED || 0) + (stats.status_breakdown?.HALTED || 0)
    : 0;

  const inProgressCount = stats?.status_breakdown?.IN_PROGRESS || 0;
  const tenderingCount =
    (stats?.status_breakdown?.TENDERING || 0) + (stats?.status_breakdown?.PLANNED || 0);

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2] flex">
      <Sidebar />

      <section className="min-h-screen flex-1 bg-[#f4f5f2]">
        {/* HEADER */}
        <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                CIVIXA · EXECUTIVE MONITORING
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                Infrastructure Dashboard
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Real-time capital performance, fund utilization, and institutional memory analytics.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Database Node
              </p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-600 flex items-center sm:justify-end gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live · Oracle Cloud (OCI)
              </p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="w-full min-w-0 px-5 py-7 sm:px-8 lg:px-10 space-y-7">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 bg-white">
            {/* MONITORED PROJECTS */}
            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Projects Monitored
                </p>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950">
                {loading ? "..." : totalProjects}
              </p>
              <p className="mt-1 text-xs text-slate-500">Centrally recorded tenders</p>
            </div>

            {/* SANCTIONED COST */}
            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Sanctioned Cost
                </p>
                <span className="h-2 w-2 rounded-full bg-slate-300" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950">
                {loading ? "..." : `₹${totalCostCr} Cr`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Disbursed: ₹{totalExpenditureCr} Cr
              </p>
            </div>

            {/* AT RISK */}
            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Projects Delayed / Halted
                </p>
                <span
                  className={`h-2 w-2 rounded-full ${
                    delayedProjectsCount > 0 ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
              </div>
              <p
                className={`mt-3 text-3xl font-bold ${
                  delayedProjectsCount > 0 ? "text-red-600" : "text-slate-950"
                }`}
              >
                {loading ? "..." : String(delayedProjectsCount).padStart(2, "0")}
              </p>
              <p className="mt-1 text-xs text-red-500">
                {delayedProjectsCount > 0
                  ? `${delayedProjectsCount} require milestone review`
                  : "All projects on baseline"}
              </p>
            </div>

            {/* AVERAGE EXECUTION */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Average Execution Rate
                </p>
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950">
                {loading ? "..." : `${stats?.overall_average_progress_pct || 0}%`}
              </p>
              <p className="mt-1 text-xs text-emerald-600">Weighted milestone progress</p>
            </div>
          </div>

          {/* MAIN GRID: PRIORITY QUEUE + PORTFOLIO HEALTH */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {/* PRIORITY QUEUE (2 COLS) */}
            <div className="lg:col-span-2 border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Priority Queue
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-slate-950">
                    Projects Requiring Attention
                  </h2>
                </div>
                <Link
                  href="/projects"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition"
                >
                  View All ({projects.length}) →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {attentionProjects.length > 0 ? (
                  attentionProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-5 sm:p-6 transition hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {p.tender_id}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                              p.status === "DELAYED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <h3 className="mt-1 text-sm font-bold text-slate-900 truncate">
                          {p.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {p.sector} · {p.district ? `${p.district}, ` : ""}{p.state}
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 bg-slate-100">
                            <div
                              className="h-full bg-slate-900"
                              style={{ width: `${Math.min(100, p.physical_progress_pct)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {p.physical_progress_pct}%
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/projects/${p.id}`}
                        className="border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-800 hover:bg-slate-950 hover:text-white transition shrink-0 self-start sm:self-center"
                      >
                        Dossier →
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-800">Portfolio Operating On Baseline</p>
                    <p className="mt-1">Zero critical milestones delayed or escalated.</p>
                  </div>
                )}
              </div>
            </div>

            {/* PORTFOLIO STATUS HEALTH (1 COL) */}
            <div className="border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Risk Overview
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-slate-950">
                  Portfolio Health
                </h2>

                <div className="mt-6 flex items-baseline justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-4xl font-black text-slate-950">
                      {stats ? `${stats.overall_average_progress_pct}%` : "0%"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Average delivery velocity</p>
                  </div>
                  <span className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Operational
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">In Progress</span>
                      <span className="font-bold text-slate-900">{inProgressCount}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${totalProjects ? (inProgressCount / totalProjects) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Tendering / Planned</span>
                      <span className="font-bold text-slate-900">{tenderingCount}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100">
                      <div
                        className="h-full bg-amber-400"
                        style={{
                          width: `${totalProjects ? (tenderingCount / totalProjects) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Delayed</span>
                      <span className="font-bold text-red-600">{delayedProjectsCount}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${totalProjects ? (delayedProjectsCount / totalProjects) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/projects"
                className="mt-8 block border border-slate-950 bg-slate-950 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800 transition"
              >
                Inspect All Projects →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
