const interventions = [
  {
    priority: "01",
    project: "Urban Water Network",
    issue: "Cost escalation",
    detail: "Expenditure is trending above the planned curve.",
    action: "Review budget",
  },
  {
    priority: "02",
    project: "Metro Extension Phase II",
    issue: "Schedule slippage",
    detail: "Current progress indicates a potential completion delay.",
    action: "Review schedule",
  },
  {
    priority: "03",
    project: "Eastern Freight Corridor",
    issue: "Milestone risk",
    detail: "Two upcoming milestones have limited schedule buffer.",
    action: "Inspect milestones",
  },
];

export default function InterventionQueue() {
  return (
    <section className="border border-slate-200 bg-white">

      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-slate-200 px-6 py-5">

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
            Decision support
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Priority Intervention Queue
          </h2>
        </div>

        <span className="text-xs text-slate-400">
          Prototype recommendations
        </span>

      </div>


      {/* QUEUE */}
      <div className="divide-y divide-slate-100">

        {interventions.map((item) => (
          <div
            key={item.priority}
            className="grid grid-cols-[48px_1fr_auto] gap-5 px-6 py-5"
          >

            {/* NUMBER */}
            <div className="text-sm font-semibold text-slate-300">
              {item.priority}
            </div>


            {/* INFORMATION */}
            <div>

              <div className="flex items-center gap-3">

                <h3 className="text-sm font-semibold text-slate-900">
                  {item.project}
                </h3>

                <span className="border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-red-600">
                  {item.issue}
                </span>

              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.detail}
              </p>

            </div>


            {/* ACTION */}
            <button className="self-center border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-950">
              {item.action} →
            </button>

          </div>
        ))}

      </div>


      {/* FOOTER */}
      <div className="border-t border-slate-200 px-6 py-4">

        <button className="text-xs font-medium text-slate-500 hover:text-slate-950">
          View all intervention recommendations →
        </button>

      </div>

    </section>
  );
}