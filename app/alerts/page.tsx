"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";

type Alert = {
  id: string;
  projectId: string;
  projectName: string;
  location: string;
  risk: "Low" | "Medium" | "High";
  probability: number;
  signal: string;
  status: "Active" | "Resolved";
  createdAt: string;
};

type AlertsResponse = {
  success: boolean;
  alerts: Alert[];
};

type AlertMutationResponse = {
  success: boolean;
  alert?: Alert;
  alerts?: Alert[];
  deleted?: number;
  alreadyExists?: boolean;
  error?: string;
};

const riskColor = (risk: string) => {
  if (risk === "High") return "text-red-600";
  if (risk === "Medium") return "text-amber-600";
  return "text-emerald-600";
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [activeOpen, setActiveOpen] = useState(true);
  const [resolvedOpen, setResolvedOpen] = useState(true);

  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [deletingHistory, setDeletingHistory] = useState(false);

  /*
    Load alerts from the CIVIXA API.
  */

  const loadAlerts = async () => {
    try {
      setError("");

      const response = await fetch("/api/alerts", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load alerts");
      }

      const result: AlertsResponse = await response.json();

      if (!result.success) {
        throw new Error("Alerts API returned an error");
      }

      setAlerts(result.alerts);
    } catch (err) {
      console.error(err);
      setError("Unable to load project alerts.");
    } finally {
      setLoaded(true);
    }
  };

  /*
    Load alerts when page opens.
  */

  useEffect(() => {
    loadAlerts();
  }, []);

  const activeAlerts = alerts.filter(
    (alert) => alert.status === "Active",
  );

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "Resolved",
  );

  const highRiskAlerts = activeAlerts.filter(
    (alert) => alert.risk === "High",
  );

  /*
    Resolve an alert through the CIVIXA API.
  */

  const resolveAlert = async (id: string) => {
    try {
      setResolvingId(id);
      setError("");

      const response = await fetch("/api/alerts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: "Resolved",
        }),
      });

      const result: AlertMutationResponse = await response.json();

      if (!response.ok || !result.success || !result.alert) {
        throw new Error(
          result.error || "Unable to resolve alert.",
        );
      }

      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === id ? result.alert! : alert,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to resolve this alert.",
      );
    } finally {
      setResolvingId(null);
    }
  };

  /*
    Delete all resolved alert history through
    the CIVIXA API.
  */

  const deleteResolvedHistory = async () => {
    try {
      setDeletingHistory(true);
      setError("");

      const response = await fetch("/api/alerts", {
        method: "DELETE",
      });

      const result: AlertMutationResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to delete alert history.",
        );
      }

      if (result.alerts) {
        setAlerts(result.alerts);
      } else {
        setAlerts((currentAlerts) =>
          currentAlerts.filter(
            (alert) => alert.status === "Active",
          ),
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete alert history.",
      );
    } finally {
      setDeletingHistory(false);
    }
  };

  /*
    Initial loading state.
  */

  if (!loaded) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden bg-[#f4f5f2]">
        <Sidebar />

        <section className="min-h-screen w-full bg-[#f4f5f2]">
          <div className="p-10">
            <p className="text-sm text-slate-500">
              Loading alerts...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f4f5f2]">
      <Sidebar />

      <section className="min-h-screen w-full bg-[#f4f5f2]">

        {/* HEADER */}

        <header className="w-full border-b border-slate-200 px-5 py-7 sm:px-8 lg:px-10">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            CIVIXA · RISK MONITORING
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Alerts
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor active project risks and respond to emerging
            infrastructure warnings.
          </p>

        </header>

        {/* CONTENT */}

        <div className="w-full px-5 py-7 sm:px-8 lg:px-10 lg:py-9">

          {/* API ERROR */}

          {error && (
            <div className="mb-6 border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* SUMMARY */}

          <div className="grid grid-cols-1 border border-slate-200 bg-white sm:grid-cols-3">

            <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">

              <p className="text-xs uppercase tracking-wider text-slate-400">
                Active alerts
              </p>

              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {activeAlerts.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Currently being monitored
              </p>

            </div>

            <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">

              <p className="text-xs uppercase tracking-wider text-slate-400">
                High risk alerts
              </p>

              <p className="mt-3 text-3xl font-semibold text-red-600">
                {highRiskAlerts.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Require immediate attention
              </p>

            </div>

            <div className="p-5">

              <p className="text-xs uppercase tracking-wider text-slate-400">
                Recently resolved
              </p>

              <p className="mt-3 text-3xl font-semibold text-emerald-600">
                {resolvedAlerts.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Alerts closed by monitoring team
              </p>

            </div>

          </div>

          {/* ACTIVE ALERTS */}

          <div className="mt-6 border border-slate-200 bg-white">

            <button
              type="button"
              onClick={() => setActiveOpen(!activeOpen)}
              className="flex w-full items-center justify-between border-b border-slate-200 px-5 py-5 text-left sm:px-6"
            >

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Risk notifications
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  Active Project Alerts
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {activeAlerts.length} active alert
                  {activeAlerts.length !== 1 ? "s" : ""} requiring monitoring.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <span className="border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-red-600">
                  {activeAlerts.length} Active
                </span>

                <span className="text-lg text-slate-500">
                  {activeOpen ? "−" : "+"}
                </span>

              </div>

            </button>

            {activeOpen && (

              <>

                {activeAlerts.length === 0 ? (

                  <div className="px-5 py-12 text-center">

                    <p className="text-sm font-medium text-slate-800">
                      No active alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      All project risk alerts have been resolved.
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {activeAlerts.map((alert) => (

                      <div
                        key={alert.id}
                        className="px-5 py-6 sm:px-6"
                      >

                        {/* TOP */}

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-3">

                              <h3 className="text-sm font-semibold text-slate-950">
                                {alert.projectName}
                              </h3>

                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wider ${riskColor(
                                  alert.risk,
                                )}`}
                              >
                                {alert.risk} risk
                              </span>

                              <span className="border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-red-600">
                                Active
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {alert.location} · {alert.projectId}
                            </p>

                          </div>

                          <div className="text-left lg:text-right">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Risk probability
                            </p>

                            <p
                              className={`mt-1 text-lg font-semibold ${riskColor(
                                alert.risk,
                              )}`}
                            >
                              {alert.probability}%
                            </p>

                          </div>

                        </div>

                        {/* DETAILS */}

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                          <div className="border border-slate-200 p-4">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Primary signal
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-800">
                              {alert.signal}
                            </p>

                          </div>

                          <div className="border border-slate-200 p-4">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Alert ID
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-800">
                              {alert.id}
                            </p>

                          </div>

                          <div className="border border-slate-200 p-4">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Alert date
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-800">
                              {alert.createdAt}
                            </p>

                          </div>

                        </div>

                        {/* ACTION */}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">

                          <Link
                            href={`/projects/${alert.projectId}`}
                            className="border border-slate-300 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-600 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white"
                          >
                            View Project
                          </Link>

                          <button
                            type="button"
                            disabled={resolvingId === alert.id}
                            onClick={() => resolveAlert(alert.id)}
                            className="border border-slate-300 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-600 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {resolvingId === alert.id
                              ? "Resolving..."
                              : "Mark Resolved"}
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </>

            )}

          </div>

          {/* RECENTLY RESOLVED */}

          <div className="mt-6 border border-slate-200 bg-white">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">

              <button
                type="button"
                onClick={() => setResolvedOpen(!resolvedOpen)}
                className="flex min-w-0 flex-1 items-center justify-between text-left"
              >

                <div>

                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                    Alert history
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    Recently Resolved
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Alerts that have been closed after corrective action.
                  </p>

                </div>

                <div className="ml-4 flex shrink-0 items-center gap-3">

                  <span className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-600">
                    {resolvedAlerts.length} Resolved
                  </span>

                  <span className="text-lg text-slate-500">
                    {resolvedOpen ? "−" : "+"}
                  </span>

                </div>

              </button>

              {resolvedAlerts.length > 0 && (
                <button
                  type="button"
                  disabled={deletingHistory}
                  onClick={deleteResolvedHistory}
                  className="ml-4 shrink-0 border border-red-200 px-3 py-2 text-[9px] font-medium uppercase tracking-wider text-red-600 transition hover:border-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingHistory
                    ? "Deleting..."
                    : "Delete History"}
                </button>
              )}

            </div>

            {resolvedOpen && (

              <>

                {resolvedAlerts.length === 0 ? (

                  <div className="px-5 py-12 text-center">

                    <p className="text-sm font-medium text-slate-800">
                      No resolved alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Resolved alerts will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {resolvedAlerts.map((alert) => (

                      <div
                        key={alert.id}
                        className="px-5 py-6 sm:px-6"
                      >

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-3">

                              <h3 className="text-sm font-semibold text-slate-950">
                                {alert.projectName}
                              </h3>

                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wider ${riskColor(
                                  alert.risk,
                                )}`}
                              >
                                {alert.risk} risk
                              </span>

                              <span className="border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-emerald-600">
                                Resolved
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {alert.location} · {alert.projectId}
                            </p>

                          </div>

                          <div className="text-left lg:text-right">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Risk probability
                            </p>

                            <p
                              className={`mt-1 text-lg font-semibold ${riskColor(
                                alert.risk,
                              )}`}
                            >
                              {alert.probability}%
                            </p>

                          </div>

                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                          <div className="border border-slate-200 p-4">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Primary signal
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-800">
                              {alert.signal}
                            </p>

                          </div>

                          <div className="border border-slate-200 p-4">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Alert ID
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-800">
                              {alert.id}
                            </p>

                          </div>

                          <div className="border border-slate-200 p-4">

                            <p className="text-[10px] uppercase tracking-wider text-slate-400">
                              Alert date
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-800">
                              {alert.createdAt}
                            </p>

                          </div>

                        </div>

                        {/* VIEW PROJECT */}

                        <div className="mt-5 flex justify-end">

                          <Link
                            href={`/projects/${alert.projectId}`}
                            className="border border-slate-300 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-600 transition hover:border-slate-900 hover:bg-slate-950 hover:text-white"
                          >
                            View Project
                          </Link>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </>

            )}

          </div>

          {/* FOOTNOTE */}

          <div className="mt-5 flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              CIVIXA risk monitoring interface.
            </p>

            <p>
              Alert source · /api/alerts
            </p>

          </div>

        </div>

      </section>
    </main>
  );
}