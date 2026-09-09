"use client";

import { useState } from "react";

const reports = [
  {
    id: "RPT-001",
    title: "Portfolio Risk Summary",
    description:
      "Overview of project risk levels, emerging signals and priority interventions.",
    type: "Risk Analysis",
    updated: "April 2026",
    coverage: "1,981 projects",
    status: "Available",
  },
  {
    id: "RPT-002",
    title: "Cost Overrun Assessment",
    description:
      "Analysis of project expenditure against approved and revised project costs.",
    type: "Cost Analysis",
    updated: "April 2026",
    coverage: "1,981 projects",
    status: "Available",
  },
  {
    id: "RPT-003",
    title: "Schedule Performance Report",
    description:
      "Summary of project timelines, delays and milestone performance across the portfolio.",
    type: "Schedule Analysis",
    updated: "April 2026",
    coverage: "1,981 projects",
    status: "Available",
  },
];

const reportTypes = [
  "All",
  "Risk Analysis",
  "Cost Analysis",
  "Schedule Analysis",
];

export default function ReportsPage() {
  const [activeType, setActiveType] = useState("All");

  const filteredReports =
    activeType === "All"
      ? reports
      : reports.filter((report) => report.type === activeType);

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2]">
      {/* HEADER */}
      <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              CIVIXA · REPORTING
            </p>

            <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">
              Reports & Insights
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Generate, review and organize analytical reports for the
              monitored infrastructure portfolio.
            </p>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Reporting period
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              April 2026
            </p>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="w-full min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {/* SUMMARY */}
        <div className="grid w-full min-w-0 grid-cols-1 border border-slate-200 bg-white sm:grid-cols-3">
          <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Available reports
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-950">
              03
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Analytical outputs
            </p>
          </div>

          <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Reporting period
            </p>

            <p className="mt-3 text-2xl font-semibold text-slate-950">
              April 2026
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Latest available data
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Data coverage
            </p>

            <p className="mt-3 text-2xl font-semibold text-slate-950">
              1,981
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Monitored projects
            </p>
          </div>
        </div>

        {/* REPORT LIBRARY */}
        <div className="mt-7 w-full min-w-0 border border-slate-200 bg-white">
          {/* HEADER */}
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Report library
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  Analytical Reports
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Monitoring and analytical outputs currently available
                </p>
              </div>

              {/* FILTERS */}
              <div className="flex min-w-0 flex-wrap gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`border px-3 py-2 text-xs font-medium transition ${
                      activeType === type
                        ? "border-slate-900 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* REPORTS */}
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="min-w-0 px-5 py-6 transition hover:bg-slate-50 sm:px-6"
              >
                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* REPORT INFO */}
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                      <span className="text-[10px] font-medium tracking-wider text-slate-400">
                        {report.id}
                      </span>

                      <h3 className="break-words text-sm font-semibold text-slate-900">
                        {report.title}
                      </h3>

                      <span className="w-fit border border-slate-200 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {report.type}
                      </span>
                    </div>

                    <p className="mt-2 max-w-3xl break-words text-xs leading-5 text-slate-500">
                      {report.description}
                    </p>

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="text-[10px] text-slate-400">
                        Updated {report.updated}
                      </span>

                      <span className="text-[10px] text-slate-300">
                        |
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Coverage · {report.coverage}
                      </span>

                      <span className="text-[10px] text-emerald-600">
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {/* ACTION */}
                  <button
                    type="button"
                    className="w-full shrink-0 border border-slate-300 px-5 py-2.5 text-xs font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white sm:w-auto"
                  >
                    Open Report →
                  </button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No reports found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  No reports match the selected category.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* REPORT GENERATION */}
        <div className="mt-6 w-full min-w-0 border border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                Custom reporting
              </p>

              <h2 className="mt-2 break-words text-lg font-semibold">
                Generate a custom report
              </h2>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">
                Select projects, reporting periods and analytical indicators
                to create a customized portfolio report. This workflow can
                later connect directly to the project database and predictive
                analytics engine.
              </p>
            </div>

            <button
              type="button"
              className="w-full shrink-0 border border-slate-700 px-5 py-3 text-xs font-medium text-slate-300 transition hover:border-white hover:text-white sm:w-auto"
            >
              Create Report →
            </button>
          </div>
        </div>

        {/* FUTURE DATA NOTE */}
        <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
              Report workflow
            </p>

            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              From data to decision
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Future reports can combine project performance, financial
              movement, schedule variance and predictive risk signals into
              a single decision-ready output.
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
              System status
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-sm font-medium text-slate-800">
                Reporting interface operational
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Report generation and export will be connected once the
              underlying project data pipeline is available.
            </p>
          </div>
        </div>

        {/* FOOTNOTE */}
        <div className="mt-5 flex min-w-0 flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Prototype reporting interface.
          </p>

          <p>
            Data reference · April 2026
          </p>
        </div>
      </div>
    </main>
  );
}