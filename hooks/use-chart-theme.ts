"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

/** Recharts / canvas strokes that must track light/dark surfaces. */
export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  return useMemo(() => {
    const dark = resolvedTheme === "dark";
    return {
      grid: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
      axis: dark ? "#e5e7eb" : "#4b5563",
      tooltipBg: dark ? "#1f2937" : "#ffffff",
      tooltipBorder: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
      tooltipColor: dark ? "#f9fafb" : "#111827",
    };
  }, [resolvedTheme]);
}
