const riskData = [
  {
    label: "High Risk",
    value: 127,
    description: "Immediate attention",
    indicator: "bg-red-500",
  },
  {
    label: "Watchlist",
    value: 314,
    description: "Requires monitoring",
    indicator: "bg-amber-400",
  },
  {
    label: "Stable",
    value: 1540,
    description: "No immediate concern",
    indicator: "bg-emerald-500",
  },
];

const riskDrivers = [
  {
    label: "Schedule delays",
    value: 42,
  },
  {
    label: "Cost escalation",
    value: 31,
  },
  {
    label: "Milestone slippage",
    value: 18,
  },
  {
    label: "Other factors",
    value: 9,
  },
];

export default function RiskOverview() {
  return (
    <section className="border border-slate-200 bg-white">

      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-slate-200 px-6 py-5">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
            Predictive signal
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Portfolio Risk
          </h2>
        </div>

        <p className="text-xs text-slate-400">
          Prototype model output
        </p>

      </div>


      {/* RISK LEVELS */}
      <div className="grid grid-cols-3 divide-x divide-slate-200">

        {riskData.map((risk) => (
          <div key={risk.label} className="p-6">

            <div className="flex items-center gap-2">

              <span
                className={`h-2 w-2 rounded-full ${risk.indicator}`}
              />

              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {risk.label}
              </span>

            </div>

            <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              {risk.value.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {risk.description}
            </p>

          </div>
        ))}

      </div>


      {/* RISK DRIVERS */}
      <div className="border-t border-slate-200 px-6 py-6">

        <div className="mb-5">

          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
            Contributing factors
          </p>

          <h3 className="mt-1 text-sm font-semibold text-slate-950">
            Emerging risk drivers
          </h3>

        </div>


        <div className="space-y-4">

          {riskDrivers.map((driver) => (
            <div key={driver.label}>

              <div className="mb-2 flex items-center justify-between">

                <span className="text-xs text-slate-600">
                  {driver.label}
                </span>

                <span className="text-xs font-semibold text-slate-700">
                  {driver.value}%
                </span>

              </div>

              <div className="h-1.5 bg-slate-100">

                <div
                  className="h-full bg-slate-800"
                  style={{
                    width: `${driver.value}%`,
                  }}
                />

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}