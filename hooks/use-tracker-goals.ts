"use client";

import { useCallback, useEffect, useState } from "react";

export type DailyGoals = {
  daily_calorie_goal: number | null;
  daily_protein_goal_g: number | null;
  daily_carbs_goal_g: number | null;
  daily_fat_goal_g: number | null;
};

export function useTrackerGoals(enabled: boolean) {
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setGoals(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/goals", { credentials: "include" });
      const json = (await res.json()) as { data?: DailyGoals; error?: string };
      if (!res.ok) throw new Error(json.error ?? res.statusText);
      setGoals(json.data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load goals");
      setGoals(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { goals, loading, error, reloadGoals: reload };
}
