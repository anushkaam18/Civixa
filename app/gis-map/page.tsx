"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";

const projects = [
  {
    id: "NH-19",
    name: "NH-19 Road Widening",
    location: "West Bengal",
    sector: "Transport",
    risk: "Low",
    progress: 82,
    position: "left-[25%] top-[38%]",
  },
  {
    id: "URBAN-01",
    name: "Urban Water Network",
    location: "Kolkata",
    sector: "Water",
    risk: "High",
    progress: 61,
    position: "left-[46%] top-[55%]",
  },
  {
    id: "POWER-07",
    name: "Regional Power Transmission",
    location: "Odisha",
    sector: "Energy",
    risk: "Medium",
    progress: 74,
    position: "left-[61%] top-[43%]",
  },
  {
    id: "RAIL-12",
    name: "Eastern Freight Corridor",
    location: "Bihar",
    sector: "Transport",
    risk: "Medium",
    progress: 69,
    position: "left-[70%] top-[28%]",
  },
];

const riskStyles = {
  Low: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    border: "border-emerald-200",
    bg: "bg-emerald-50",
  },

  Medium: {
    dot: "bg-amber-400",
    text: "text-amber-600",
    border: "border-amber-200",
    bg: "bg-amber-50",
  },

  High: {
    dot: "bg-red-500",
    text: "text-red-600",
    border: "border-red-200",
    bg: "bg-red-50",
  },
};

export default function GISMapPage() {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [sector, setSector] = useState("All sectors");
  const [risk, setRisk] = useState("All risks");

  const filteredProjects = projects.filter((project) => {
    const sectorMatch =
      sector === "All sectors" || project.sector === sector;

    const riskMatch =
      risk === "All risks" || project.risk === risk;

    return sectorMatch && riskMatch;
  });

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* PAGE CONTENT */}
      <section className="min-h-screen w-full min-w-0 bg-[#f4f5f2]">

        {/* HEADER */}
        <header className="w-full border-b border-slate-200 bg-[#f4f5f2] px-5 py-7 sm:px-8 lg:px-10">

          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                CIVIXA · GIS MAP
              </p>

              <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">
                Infrastructure Map
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Geographic view of monitored infrastructure projects,
                implementation progress and risk signals.
              </p>

            </div>

            <div className="shrink-0">

              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Projects mapped
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {projects.length} active locations
              </p>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <div className="w-full min-w-0 bg-[#f4f5f2] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">

          {/* MAP CONTROLS */}
          <div className="flex w-full min-w-0 flex-col gap-5 border border-slate-200 bg-white px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                Project locations
              </p>

              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Infrastructure portfolio
              </h2>

            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

              {/* SECTOR FILTER */}
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 outline-none transition focus:border-slate-400 sm:w-auto"
              >
                <option>All sectors</option>
                <option>Transport</option>
                <option>Water</option>
                <option>Energy</option>
              </select>

              {/* RISK FILTER */}
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="w-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 outline-none transition focus:border-slate-400 sm:w-auto"
              >
                <option>All risks</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

            </div>

          </div>

          {/* MAP + DETAILS */}
          <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">

            {/* MAP */}
            <div className="relative h-[460px] min-w-0 overflow-hidden border border-slate-200 bg-[#e9ece8] sm:h-[560px] lg:h-[620px]">

              {/* MAP GRID */}
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                  backgroundSize: "45px 45px",
                }}
              />

              {/* LAND SHAPES */}
              <div className="absolute left-[18%] top-[10%] h-[75%] w-[42%] rotate-[8deg] rounded-[45%] border border-slate-300 bg-[#e2e6e1]" />

              <div className="absolute left-[47%] top-[18%] h-[60%] w-[30%] rotate-[-12deg] rounded-[40%] border border-slate-300 bg-[#e2e6e1]" />

              <div className="absolute bottom-[5%] left-[35%] h-[22%] w-[45%] rotate-[5deg] rounded-[50%] border border-slate-300 bg-[#e2e6e1]" />

              {/* ROADS */}
              <div className="absolute left-[8%] top-[48%] h-px w-[85%] rotate-[-12deg] bg-slate-300" />

              <div className="absolute left-[28%] top-[15%] h-[75%] w-px rotate-[18deg] bg-slate-300" />

              <div className="absolute left-[55%] top-[10%] h-[85%] w-px rotate-[-10deg] bg-slate-300" />

              <div className="absolute left-[10%] top-[68%] h-px w-[80%] rotate-[8deg] bg-slate-300" />

              {/* MAP LABEL */}
              <div className="absolute left-5 top-5 z-10 border border-slate-300 bg-white px-4 py-3 shadow-sm">

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  GIS layer
                </p>

                <p className="mt-1 text-xs font-medium text-slate-800">
                  India · Infrastructure
                </p>

              </div>

              {/* NORTH */}
              <div className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center border border-slate-300 bg-white text-xs font-semibold text-slate-600 shadow-sm">
                N
              </div>

              {/* PROJECT MARKERS */}
              {filteredProjects.map((project) => {

                const styles =
                  riskStyles[
                    project.risk as keyof typeof riskStyles
                  ];

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className={`absolute ${project.position} z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white shadow-md transition hover:scale-125 ${styles.dot}`}
                    aria-label={`Select ${project.name}`}
                  >
                    <span className="sr-only">
                      {project.name}
                    </span>
                  </button>
                );

              })}

              {/* EMPTY STATE */}
              {filteredProjects.length === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">

                  <div className="border border-slate-300 bg-white px-6 py-5 text-center shadow-sm">

                    <p className="text-sm font-medium text-slate-800">
                      No projects found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing the selected filters.
                    </p>

                  </div>

                </div>
              )}

              {/* SCALE */}
              <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2">

                <div className="h-px w-16 bg-slate-600" />

                <span className="text-[10px] text-slate-500">
                  100 km
                </span>

              </div>

            </div>

            {/* PROJECT DETAILS */}
            <div className="min-w-0 border border-slate-200 bg-white">

              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Selected project
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  Location details
                </h2>

              </div>

              <div className="p-5 sm:p-6">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {selectedProject.id}
                    </p>

                    <h3 className="mt-1 break-words text-base font-semibold text-slate-900">
                      {selectedProject.name}
                    </h3>

                  </div>

                  <span
                    className={`shrink-0 border px-2.5 py-1 text-[10px] font-medium ${
                      riskStyles[
                        selectedProject.risk as keyof typeof riskStyles
                      ].border
                    } ${
                      riskStyles[
                        selectedProject.risk as keyof typeof riskStyles
                      ].bg
                    } ${
                      riskStyles[
                        selectedProject.risk as keyof typeof riskStyles
                      ].text
                    }`}
                  >
                    {selectedProject.risk} risk
                  </span>

                </div>

                <div className="mt-6 space-y-5">

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedProject.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Sector
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedProject.sector}
                    </p>
                  </div>

                  <div>

                    <div className="flex items-center justify-between">

                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        Implementation progress
                      </p>

                      <span className="text-xs font-medium text-slate-700">
                        {selectedProject.progress}%
                      </span>

                    </div>

                    <div className="mt-2 h-2 bg-slate-100">

                      <div
                        className="h-full bg-slate-900"
                        style={{
                          width: `${selectedProject.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  className="mt-7 w-full border border-slate-300 px-4 py-3 text-xs font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white"
                >
                  View project details →
                </button>

              </div>

            </div>

          </div>

          {/* LEGEND */}
          <div className="mt-6 flex min-w-0 flex-col gap-4 border border-slate-200 bg-white px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8 sm:px-6">

            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
              Risk legend
            </p>

            {(["Low", "Medium", "High"] as const).map((level) => (

              <div
                key={level}
                className="flex items-center gap-2"
              >

                <span
                  className={`h-2.5 w-2.5 rounded-full ${riskStyles[level].dot}`}
                />

                <span className="text-xs text-slate-600">
                  {level}
                </span>

              </div>

            ))}

            <span className="hidden h-4 w-px bg-slate-200 sm:block" />

            <p className="text-[11px] text-slate-400">
              {filteredProjects.length} of {projects.length} projects displayed
            </p>

          </div>

          {/* FOOTNOTE */}
          <div className="mt-5 flex min-w-0 flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Prototype GIS interface.
            </p>

            <p>
              Data reference · April 2026
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}