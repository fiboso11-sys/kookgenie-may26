"use client";

import { useMemo } from "react";
import type { WeightLog } from "@/types/database";
import { weightByLocalDay } from "@/lib/health-analytics";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "@/hooks/use-chart-theme";

type Props = {
  logs: WeightLog[];
};

export function WeightChart({ logs }: Props) {
  const chart = useChartTheme();
  const data = useMemo(() => {
    const pts = weightByLocalDay(logs).slice(-56);
    return pts.map((p) => ({ name: p.day.slice(5), kg: p.weight }));
  }, [logs]);

  if (data.length < 2) {
    return (
      <div className="flex h-52 items-center justify-center rounded-2xl border border-kg-border bg-kg-elevated px-4 text-center text-sm text-kg-muted">
        Log at least two days of weight to see a trend.
      </div>
    );
  }

  return (
    <div className="h-56 w-full touch-pan-x rounded-2xl border border-kg-border bg-kg-elevated p-2 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: chart.axis }} tickLine={false} axisLine={{ stroke: chart.grid }} />
          <YAxis
            domain={["auto", "auto"]}
            width={40}
            tick={{ fontSize: 11, fill: chart.axis }}
            tickLine={false}
            axisLine={{ stroke: chart.grid }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chart.tooltipBg,
              border: `1px solid ${chart.tooltipBorder}`,
              borderRadius: "12px",
              color: chart.tooltipColor,
              fontSize: "13px",
            }}
            labelStyle={{ color: chart.tooltipColor, fontWeight: 600 }}
          />
          <Line type="monotone" dataKey="kg" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: "#16a34a" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
