"use client";

import { useCallback, useEffect, useState } from "react";

export type HealthSettings = {
  daily_water_goal_ml: number | null;
  height: number | null;
  weight: number | null;
  target_weight: number | null;
};

export function useHealthSettings(enabled: boolean) {
  const [settings, setSettings] = useState<HealthSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/health-settings", { credentials: "include" });
      const json = (await res.json()) as { data?: HealthSettings; error?: string };
      if (!res.ok) throw new Error(json.error ?? res.statusText);
      setSettings(json.data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load health settings");
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { settings, loading, error, reload };
}
