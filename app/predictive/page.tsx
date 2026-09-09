"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";

type Signal = {
  label: string;
  value: number;
  weight: number;
};

type RiskProject = {
  id: string;
  name: string;
  location: string;
  progress: number;
  status: string;
  risk: "Low" | "Medium" | "High";
  probability: number;
  primarySignal: string;
  signals: Signal[];
  emergingSignals: number;
  prediction: string;
  action: string;

  inputData?: {
    scheduleVariance: number;
    costVariance: number;
    milestoneDelay: number;
    complaints: number;
    failedInspections: number;
  };

  scoring?: {
    schedule: {
      input: number;
      normalized: number;
      weight: number;
    };
    cost: {
      input: number;
      normalized: number;
      weight: number;
    };
    milestone: {
      input: number;
      normalized: number;
      weight: number;
    };
    complaints: {
      input: number;
      normalized: number;
      weight: number;
    };
    inspections: {
      input: number;
      normalized: number;
      weight: number;
    };
  };
};

type PredictiveResponse = {
  success: boolean;

  model: {
    name: string;
    version: string;
    type: string;
    status: string;
  };

  portfolio: {
    projectsAssessed: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    emergingSignals: number;
  };

  predictions: RiskProject[];
};

const riskColor = (risk: string) => {
  if (risk === "High") return "text-red-600";
  if (risk === "Medium") return "text-amber-600";
  return "text-emerald-600";
};

const riskBackground = (risk: string) => {
  if (risk === "High") return "bg-red-50 border-red-100";
  if (risk === "Medium") return "bg-amber-50 border-amber-100";
  return "bg-emerald-50 border-emerald-100";
};

const barColor = (value: number) => {
  if (value >= 75) return "bg-red-500";
  if (value >= 50) return "bg-amber-400";
  return "bg-slate-900";
};

export default function PredictivePage() {
  const [data, setData] = useState<PredictiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [alertProject, setAlertProject] =
    useState<RiskProject | null>(null);

  const [alertCreated, setAlertCreated] = useState(false);
  const [creatingAlert, setCreatingAlert] = useState(false);
  const [alertError, setAlertError] = useState("");

  useEffect(() => {
    async function loadPredictiveData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/predictive", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load predictive data");
        }

        const result: PredictiveResponse = await response.json();

        if (!result.success) {
          throw new Error("Predictive API returned an error");
        }

        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load predictive monitoring data.");
      } finally {
        setLoading(false);
      }
    }

    loadPredictiveData();
  }, []);

  const createAlert = async (project: RiskProject) => {
    try {
      setCreatingAlert(true);
      setAlertError("");

      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          location: project.location,
          risk: project.risk,
          probability: project.probability,
          signal: project.primarySignal,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to create alert.",
        );
      }

      setAlertCreated(true);
    } catch (err) {
      console.error(err);

      setAlertError(
        err instanceof Error
          ? err.message
          : "Failed to create alert.",
      );
    } finally {
      setCreatingAlert(false);
    }
  };

  const highestRiskProject =
    data?.predictions?.length
      ? [...data.predictions].sort(
          (a, b) => b.probability - a.probability,
        )[0]
      : null;

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f5f2]">
      <Sidebar />

      <section className="min-h-screen w-full min-w-0 bg-[#f4f5f2]">

        {/* HEADER */}

        <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            CIVIXA · PREDICTIVE INTELLIGENCE
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Early Warning
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Look beyond the current state of projects. Predictive intelligence
            identifies patterns that may lead to schedule, cost and
            implementation risk.
          </p>

        </header>

        {/* CONTENT */}

        <div className="w-full min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">

          {loading && (
            <div className="border border-slate-200 bg-white p-8">
              <p className="text-sm text-slate-500">
                Loading predictive analysis...
              </p>
            </div>
          )}

          {error && (
            <div className="border border-red-200 bg-red-50 p-6">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <p className="mt-1 text-xs text-red-600">
                Check that /api/predictive is available.
              </p>

            </div>
          )}

          {data && (
            <>

              {/* MODEL + PORTFOLIO INTELLIGENCE */}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">

                {/* MODEL */}

                <div className="border border-slate-200 bg-white p-5 sm:p-6">

                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    Predictive engine
                  </p>

                  <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                      <h2 className="text-lg font-semibold text-slate-950">
                        {data.model.name}
                      </h2>

                      <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                        The risk engine evaluates schedule variance,
                        expenditure variance, milestone delays, complaints and
                        inspection history to identify conditions that may
                        develop into project risk.
                      </p>

                    </div>

                    <div className="shrink-0 border border-emerald-100 bg-emerald-50 px-4 py-3">

                      <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
                        Engine status
                      </p>

                      <p className="mt-1 text-xs font-medium text-emerald-700">
                        {data.model.status}
                      </p>

                      <p className="mt-1 text-[10px] text-emerald-600">
                        {data.model.version}
                      </p>

                    </div>

                  </div>

                </div>

                {/* HIGHEST RISK */}

                {highestRiskProject && (
                  <div
                    className={`border p-5 sm:p-6 ${riskBackground(
                      highestRiskProject.risk,
                    )}`}
                  >

                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                      Highest predicted risk
                    </p>

                    <div className="mt-3 flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h2 className="break-words text-lg font-semibold text-slate-950">
                          {highestRiskProject.name}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          {highestRiskProject.location} ·{" "}
                          {highestRiskProject.id}
                        </p>

                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-[10px] uppercase tracking-wider text-slate-500">
                          Probability
                        </p>

                        <p
                          className={`mt-1 text-2xl font-semibold ${riskColor(
                            highestRiskProject.risk,
                          )}`}
                        >
                          {highestRiskProject.probability}%
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 border-t border-slate-200/70 pt-4">

                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Dominant signal
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {highestRiskProject.primarySignal}
                      </p>

                    </div>

                  </div>
                )}

              </div>


              {/* PORTFOLIO RISK DISTRIBUTION */}

              <div className="mt-6 border border-slate-200 bg-white">

                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    Portfolio outlook
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    Current Risk Distribution
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    A predictive view of the projects currently being assessed
                    by the risk engine.
                  </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

                  {/* ASSESSED */}

                  <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Projects assessed
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      {data.portfolio.projectsAssessed}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Current prediction set
                    </p>

                  </div>

                  {/* HIGH */}

                  <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      High risk
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-red-600">
                      {String(data.portfolio.highRisk).padStart(2, "0")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Immediate investigation
                    </p>

                  </div>

                  {/* MEDIUM */}

                  <div className="border-b border-slate-200 p-5 sm:border-r lg:border-b-0">

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Medium risk
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-amber-600">
                      {String(data.portfolio.mediumRisk).padStart(2, "0")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Early warning zone
                    </p>

                  </div>

                  {/* SIGNALS */}

                  <div className="p-5">

                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Emerging signals
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      {data.portfolio.emergingSignals}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Across monitored projects
                    </p>

                  </div>

                </div>

              </div>


              {/* RISK PRIORITY TABLE */}

              <div className="mt-6 border border-slate-200 bg-white">

                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    Risk intelligence
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    Projects Requiring Investigation
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Ranked by predicted risk rather than project status.
                  </p>

                </div>

                <div className="divide-y divide-slate-200">

                  {data.predictions
                    .slice()
                    .sort(
                      (a, b) =>
                        b.probability - a.probability,
                    )
                    .map((project, index) => (

                      <div
                        key={project.id}
                        className="px-5 py-5 transition hover:bg-slate-50 sm:px-6"
                      >

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                          {/* RANK + PROJECT */}

                          <div className="flex min-w-0 items-start gap-4">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 text-xs font-semibold text-slate-500">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-3">

                                <h3 className="break-words text-sm font-semibold text-slate-950">
                                  {project.name}
                                </h3>

                                <span
                                  className={`text-[10px] font-semibold uppercase tracking-wider ${riskColor(
                                    project.risk,
                                  )}`}
                                >
                                  {project.risk} risk
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-slate-400">
                                {project.location} · {project.id}
                              </p>

                            </div>

                          </div>


                          {/* PROBABILITY */}

                          <div className="lg:w-40">

                            <div className="mb-2 flex items-center justify-between">

                              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                Risk probability
                              </span>

                              <span
                                className={`text-xs font-semibold ${riskColor(
                                  project.risk,
                                )}`}
                              >
                                {project.probability}%
                              </span>

                            </div>

                            <div className="h-2 w-full bg-slate-100">

                              <div
                                className={`h-full ${barColor(
                                  project.probability,
                                )}`}
                                style={{
                                  width: `${project.probability}%`,
                                }}
                              />

                            </div>

                          </div>


                          {/* SIGNAL */}

                          <div className="lg:w-52">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Primary signal
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-700">
                              {project.primarySignal}
                            </p>

                          </div>


                          {/* ACTION */}

                          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

                            <Link
                              href={`/projects/${project.id}`}
                              className="border border-slate-300 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-700 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white"
                            >
                              Investigate →
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setAlertProject(project);
                                setAlertCreated(false);
                                setAlertError("");
                              }}
                              className="border border-red-200 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-red-600 transition hover:border-red-500 hover:bg-red-50"
                            >
                              Create Alert
                            </button>

                          </div>

                        </div>

                      </div>

                    ))}

                </div>

              </div>


              {/* SELECTED PROJECT INTELLIGENCE */}

              {highestRiskProject && (
                <div className="mt-6 border border-slate-200 bg-white">

                  <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                      Prediction analysis
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      Why the Model Is Concerned
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      The strongest signals currently contributing to the
                      highest predicted risk.
                    </p>

                  </div>

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          Project
                        </p>

                        <h3 className="mt-1 text-base font-semibold text-slate-950">
                          {highestRiskProject.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {highestRiskProject.location} ·{" "}
                          {highestRiskProject.id}
                        </p>

                      </div>

                      <div className="flex items-center gap-4">

                        <div className="text-right">

                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Risk
                          </p>

                          <p
                            className={`mt-1 text-lg font-semibold ${riskColor(
                              highestRiskProject.risk,
                            )}`}
                          >
                            {highestRiskProject.risk}
                          </p>

                        </div>

                        <div className="h-8 w-px bg-slate-200" />

                        <div className="text-right">

                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Probability
                          </p>

                          <p
                            className={`mt-1 text-lg font-semibold ${riskColor(
                              highestRiskProject.risk,
                            )}`}
                          >
                            {highestRiskProject.probability}%
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* SIGNALS */}

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                      {highestRiskProject.signals.map((signal) => (

                        <div
                          key={signal.label}
                          className="border border-slate-200 p-4"
                        >

                          <div className="flex items-center justify-between">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              {signal.label}
                            </p>

                            <p className="text-xs font-semibold text-slate-700">
                              {signal.value}%
                            </p>

                          </div>

                          <div className="mt-3 h-2 w-full bg-slate-100">

                            <div
                              className={`h-full ${barColor(
                                signal.value,
                              )}`}
                              style={{
                                width: `${signal.value}%`,
                              }}
                            />

                          </div>

                          <div className="mt-2 flex justify-between">

                            <span className="text-[9px] text-slate-400">
                              Model contribution
                            </span>

                            <span className="text-[9px] font-medium text-slate-500">
                              {signal.weight}%
                            </span>

                          </div>

                        </div>

                      ))}

                    </div>


                    {/* PREDICTION + ACTION */}

                    <div className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 lg:grid-cols-2">

                      <div>

                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Predicted outcome
                        </p>

                        <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                          {highestRiskProject.prediction}
                        </p>

                      </div>

                      <div>

                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Recommended intervention
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {highestRiskProject.action}
                        </p>

                      </div>

                    </div>


                    {/* INVESTIGATION */}

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          Primary warning signal
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {highestRiskProject.primarySignal}
                        </p>

                      </div>

                      <Link
                        href={`/projects/${highestRiskProject.id}`}
                        className="border border-slate-900 bg-slate-950 px-5 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-white transition hover:bg-slate-800"
                      >
                        Investigate Project →
                      </Link>

                    </div>

                  </div>

                </div>
              )}


              {/* PREDICTIVE WORKFLOW */}

              <div className="mt-6 border border-slate-200 bg-white p-5 sm:p-6">

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Predictive workflow
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  From project data to early warning
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Predictive monitoring converts current project information
                  into signals that help identify potential future problems.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-5">

                  {[
                    {
                      title: "Project Data",
                      description: "Current implementation data",
                    },
                    {
                      title: "Historical Signals",
                      description: "Past project patterns",
                    },
                    {
                      title: "Risk Signals",
                      description: "Emerging warning indicators",
                    },
                    {
                      title: "Risk Scoring",
                      description: "Weighted prediction",
                    },
                    {
                      title: "Early Warning",
                      description: "Recommended intervention",
                    },
                  ].map((step, index) => (

                    <div
                      key={step.title}
                      className="border border-slate-200 p-4"
                    >

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Step {index + 1}
                      </p>

                      <p className="mt-2 text-xs font-medium text-slate-800">
                        {step.title}
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-slate-400">
                        {step.description}
                      </p>

                    </div>

                  ))}

                </div>

              </div>


              {/* FOOTNOTE */}

              <div className="mt-5 flex min-w-0 flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <p>
                  CIVIXA predictive intelligence interface.
                </p>

                <p>
                  Live source · /api/predictive
                </p>

              </div>

            </>
          )}

        </div>

      </section>


      {/* ALERT MODAL */}

      {alertProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={() => setAlertProject(null)}
        >

          <div
            className="w-full max-w-md border border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    Risk alert
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    {alertCreated
                      ? "Alert Created"
                      : "Create Project Alert"}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() => setAlertProject(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-2xl font-light text-slate-400 transition hover:bg-slate-100 hover:text-slate-950"
                  aria-label="Close alert dialog"
                >
                  ×
                </button>

              </div>

            </div>


            {/* MODAL CONTENT */}

            <div className="p-5 sm:p-6">

              <div className="border border-slate-200 bg-slate-50 p-4">

                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Project
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {alertProject.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {alertProject.location} · {alertProject.id}
                </p>

              </div>


              <div className="mt-5">

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Predicted risk
                </p>

                <div className="mt-2 flex items-center justify-between border border-slate-200 px-4 py-3">

                  <p className="text-sm font-medium text-slate-800">
                    Risk probability
                  </p>

                  <p
                    className={`text-sm font-semibold ${riskColor(
                      alertProject.risk,
                    )}`}
                  >
                    {alertProject.probability}%
                  </p>

                </div>

              </div>


              <div className="mt-4">

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Primary signal
                </p>

                <div className="mt-2 border border-slate-200 px-4 py-3">

                  <p className="text-sm text-slate-700">
                    {alertProject.primarySignal}
                  </p>

                </div>

              </div>


              {/* ERROR */}

              {alertError && (
                <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-xs font-medium text-red-700">
                    {alertError}
                  </p>

                </div>
              )}


              {/* SUCCESS */}

              {alertCreated && (
                <div className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-3">

                  <p className="text-xs font-medium text-emerald-700">
                    ✓ Alert created successfully
                  </p>

                  <p className="mt-1 text-[11px] text-emerald-600">
                    You will be notified when this risk condition changes.
                  </p>

                </div>
              )}


              {/* ACTIONS */}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">

                {alertCreated ? (

                  <button
                    type="button"
                    onClick={() => setAlertProject(null)}
                    className="border border-slate-900 bg-slate-950 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-slate-800"
                  >
                    Done
                  </button>

                ) : (

                  <>

                    <button
                      type="button"
                      onClick={() => setAlertProject(null)}
                      className="border border-slate-300 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-600 transition hover:border-slate-900 hover:text-slate-950"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => createAlert(alertProject)}
                      disabled={creatingAlert}
                      className="border border-red-500 bg-red-500 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creatingAlert
                        ? "Creating Alert..."
                        : "Create Alert"}
                    </button>

                  </>

                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}