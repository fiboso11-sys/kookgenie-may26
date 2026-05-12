"use client";

import { useMemo } from "react";
import type { FoodLog } from "@/types/database";
import { caloriesByLocalDay } from "@/lib/health-analytics";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "@/hooks/use-chart-theme";

type Props = {
  foodLogs: FoodLog[];
};

export function WeeklySummary({ foodLogs }: Props) {
  const chart = useChartTheme();
  const data = useMemo(() => {
    const by = caloriesByLocalDay(foodLogs);
    return by.slice(-7).map((d) => ({ name: d.day.slice(5), kcal: d.calories }));
  }, [foodLogs]);

  if (data.length === 0) {
    return (
      <div className="kg-card-dashed p-6 text-center text-sm leading-relaxed text-kg-muted">
        No calorie logs in the last week yet.
      </div>
    );
  }

  return (
    <div className="kg-card p-4">
      <h2 className="text-sm font-semibold text-kg-secondary">Calories · last 7 logged days</h2>
      <div className="mt-3 h-48 touch-pan-x">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: chart.axis }} tickLine={false} axisLine={{ stroke: chart.grid }} />
            <YAxis width={44} tick={{ fontSize: 11, fill: chart.axis }} tickLine={false} axisLine={{ stroke: chart.grid }} />
            <Tooltip
              contentStyle={{
                backgroundColor: chart.tooltipBg,
                border: `1px solid ${chart.tooltipBorder}`,
                borderRadius: "12px",
                color: chart.tooltipColor,
              }}
            />
            <Bar dataKey="kcal" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
