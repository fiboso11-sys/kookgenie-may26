"use client";

import type { WaterLog } from "@/types/database";
import { waterMlByLocalDay } from "@/lib/health-analytics";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "@/hooks/use-chart-theme";

type Props = {
  logs: WaterLog[];
  onDelete?: (id: string) => void;
};

export function HydrationHistory({ logs, onDelete }: Props) {
  const chart = useChartTheme();
  const byDay = waterMlByLocalDay(logs).slice(-14);
  const chartData = byDay.map((d) => ({ name: d.day.slice(5), ml: d.ml }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-kg-secondary">Last 14 days (ml)</h3>
      <div className="h-48 w-full touch-pan-x rounded-2xl border border-kg-border bg-kg-elevated p-2 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: chart.axis }} tickLine={false} axisLine={{ stroke: chart.grid }} />
            <YAxis width={36} tick={{ fontSize: 11, fill: chart.axis }} tickLine={false} axisLine={{ stroke: chart.grid }} />
            <Tooltip
              contentStyle={{
                backgroundColor: chart.tooltipBg,
                border: `1px solid ${chart.tooltipBorder}`,
                borderRadius: "12px",
                color: chart.tooltipColor,
              }}
            />
            <Bar dataKey="ml" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {onDelete && logs.length > 0 ? (
        <ul className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-kg-border bg-kg-elevated p-2 text-sm text-kg-foreground">
          {logs.slice(0, 40).map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-kg-surface dark:hover:bg-white/5"
            >
              <span>
                +{l.amount_ml} ml · {new Date(l.created_at).toLocaleString()}
              </span>
              <button
                type="button"
                className="min-h-9 rounded-lg px-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={() => onDelete(l.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
