"use client";

import Sidebar from "@/components/sidebar";

const sectorData = [
  { sector: "Transport", projects: 42, progress: 78 },
  { sector: "Energy", projects: 31, progress: 71 },
  { sector: "Water", projects: 27, progress: 64 },
  { sector: "Communication", projects: 19, progress: 82 },
  { sector: "Social Infra", projects: 24, progress: 69 },
];

const riskData = [
  { label: "Low", value: 58 },
  { label: "Medium", value: 29 },
  { label: "High", value: 13 },
];

const monthlyProgress = [
  { month: "Jan", value: 54 },
  { month: "Feb", value: 58 },
  { month: "Mar", value: 63 },
  { month: "Apr", value: 68 },
  { month: "May", value: 71 },
  { month: "Jun", value: 74 },
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2]">

      <Sidebar />

      <section className="min-h-screen w-full min-w-0 bg-[#f4f5f2]">

        {/* HEADER */}

        <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            PAIMANA · ANALYTICS
          </p>

          <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">
            Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Portfolio-level insights into project progress, risk and
            financial performance.
          </p>

        </header>

        {/* CONTENT */}

        <div className="w-full min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">

          {/* KPI ROW */}

          <div className="grid w-full min-w-0 grid-cols-1 border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">

            {/* PROJECTS */}

            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">

              <p className="text-xs uppercase tracking-wider text-slate-400">
                Projects monitored
              </p>

              <p className="mt-3 text-3xl font-semibold text-slate-950">
                1,981
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Across 17 ministries
              </p>

            </div>

            {/* ORIGINAL COST */}

            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">

              <p className="text-xs uppercase tracking-wider text-slate-400">
                Original cost
              </p>

              <p className="mt-3 text-3xl font-semibold text-slate-950">
                ₹37.13L Cr
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Approved project cost
              </p>

            </div>

            {/* REVISED COST */}

            <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">

              <p className="text-xs uppercase tracking-wider text-slate-400">
                Revised cost
              </p>

              <p className="mt-3 text-3xl font-semibold text-slate-950">
                ₹42.78L Cr
              </p>

              <p className="mt-1 text-xs text-amber-600">
                +15.2% portfolio variance
              </p>

            </div>

            {/* PROGRESS */}

            <div className="p-5">

              <p className="text-xs uppercase tracking-wider text-slate-400">
                Average progress
              </p>

              <p className="mt-3 text-3xl font-semibold text-slate-950">
                74%
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                +3.8% this quarter
              </p>

            </div>

          </div>

          {/* CHART AREA */}

          <div className="mt-7 grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">

            {/* PROGRESS TREND */}

            <div className="min-w-0 border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0">

                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    Portfolio trend
                  </p>

                  <h2 className="mt-1 break-words text-lg font-semibold text-slate-950">
                    Average Project Progress
                  </h2>

                </div>

                <span className="shrink-0 text-xs text-slate-400">
                  Jan–Jun 2026
                </span>

              </div>

              <div className="mt-8 overflow-hidden">

                <div className="flex h-56 min-w-0 items-end gap-2 sm:gap-5">

                  {monthlyProgress.map((item) => (

                    <div
                      key={item.month}
                      className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    >

                      <div className="mb-2 text-center text-[10px] text-slate-400">
                        {item.value}%
                      </div>

                      <div className="relative h-full min-h-0">

                        <div
                          className="absolute bottom-0 w-full bg-slate-900 transition-all"
                          style={{
                            height: `${item.value}%`,
                          }}
                        />

                      </div>

                      <p className="mt-2 text-center text-[10px] text-slate-400">
                        {item.month}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

            {/* RISK DISTRIBUTION */}

            <div className="min-w-0 border border-slate-200 bg-white p-5 sm:p-6">

              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                Risk overview
              </p>

              <h2 className="mt-1 break-words text-lg font-semibold text-slate-950">
                Project Risk Distribution
              </h2>

              <div className="mt-8">

                {riskData.map((item) => (

                  <div
                    key={item.label}
                    className="mb-6"
                  >

                    <div className="mb-2 flex justify-between">

                      <span className="text-xs font-medium text-slate-700">
                        {item.label} risk
                      </span>

                      <span className="text-xs text-slate-400">
                        {item.value}%
                      </span>

                    </div>

                    <div className="h-2 bg-slate-100">

                      <div
                        className={`h-full ${
                          item.label === "High"
                            ? "bg-red-500"
                            : item.label === "Medium"
                            ? "bg-amber-400"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${item.value}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

              <div className="mt-8 border-t border-slate-100 pt-5">

                <p className="text-xs leading-5 text-slate-500">
                  Current portfolio distribution across low, medium and
                  high implementation risk categories.
                </p>

              </div>

            </div>

          </div>

          {/* SECTOR PERFORMANCE */}

          <div className="mt-6 w-full min-w-0 border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                Sector analysis
              </p>

              <h2 className="mt-1 break-words text-lg font-semibold text-slate-950">
                Infrastructure Sector Performance
              </h2>

            </div>

            <div className="divide-y divide-slate-100">

              {sectorData.map((item) => (

                <div
                  key={item.sector}
                  className="grid min-w-0 grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-[1fr_120px_1.5fr] sm:items-center sm:px-6"
                >

                  <div className="min-w-0">

                    <p className="break-words text-sm font-medium text-slate-800">
                      {item.sector}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.projects} monitored projects
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Avg. progress
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {item.progress}%
                    </p>

                  </div>

                  <div className="min-w-0">

                    <div className="h-2 w-full bg-slate-100">

                      <div
                        className="h-full bg-slate-900"
                        style={{
                          width: `${item.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* ANALYTICAL INSIGHT */}

          <div className="mt-6 w-full min-w-0 border border-slate-200 bg-slate-950 p-5 text-white sm:p-6">

            <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="min-w-0">

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                  Analytical insight
                </p>

                <h2 className="mt-2 break-words text-lg font-semibold">
                  Revised costs are trending above approved estimates
                </h2>

                <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">
                  The portfolio's revised cost is ₹42.78L Cr compared
                  with an original estimate of ₹37.13L Cr, representing
                  a 15.2% increase across monitored projects.
                </p>

              </div>

              <div className="w-full shrink-0 border border-slate-700 px-5 py-3 lg:w-auto">

                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Portfolio signal
                </p>

                <p className="mt-1 text-xs font-medium text-slate-300">
                  Cost variance · 15.2%
                </p>

              </div>

            </div>

          </div>

          {/* FOOTNOTE */}

          <div className="mt-5 flex min-w-0 flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Prototype analytics interface.
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