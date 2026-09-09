"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    project: "NH-19",
    planned: 68,
    actual: 61,
  },
  {
    project: "Water",
    planned: 52,
    actual: 61,
  },
  {
    project: "Bridge",
    planned: 70,
    actual: 66,
  },
  {
    project: "Metro II",
    planned: 58,
    actual: 43,
  },
];

export default function CostProgressChart() {
  return (
    <div className="mt-8 h-64 w-full">

      <ResponsiveContainer width="100%" height="100%">

        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="project"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            formatter={(value) => `${value}%`}
          />

          <Bar
            dataKey="planned"
            name="Planned"
            fill="#cbd5e1"
            radius={[2, 2, 0, 0]}
          />

          <Bar
            dataKey="actual"
            name="Actual"
            fill="#0f172a"
            radius={[2, 2, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}