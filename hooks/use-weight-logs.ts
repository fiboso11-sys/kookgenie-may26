"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeightLog } from "@/types/database";
import type { BrowserSupabaseClient } from "@/lib/supabase/server-types";
import { readWeightLogsCache, saveWeightLogsCache } from "@/lib/offline/log-cache";

type Params = { from?: string; to?: string; limit?: number };

export function useWeightLogs(
  userId: string | null,
  supabase: BrowserSupabaseClient | null,
  params: Params | null | undefined = {},
) {
  const { from, to, limit } = params ?? {};

  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const refetch = useCallback(async () => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      setFromCache(false);
      setError(null);
      return;
    }
    const range = { from, to };
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    const cached = readWeightLogsCache(userId, range);
    if (offline) {
      if (cached?.length) {
        setLogs(cached);
        setFromCache(true);
        setError("Offline — showing last saved weight data on this device.");
      } else {
        setLogs([]);
        setFromCache(false);
        setError("Offline — no saved weight data on this device yet.");
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFromCache(false);
    try {
      const sp = new URLSearchParams();
      if (from) sp.set("from", from);
      if (to) sp.set("to", to);
      if (limit) sp.set("limit", String(limit));
      const res = await fetch(`/api/weight-logs?${sp}`, { credentials: "include" });
      const json = (await res.json()) as { data?: WeightLog[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? res.statusText);
      const raw = json.data;
      const data = Array.isArray(raw) ? raw : [];
      setLogs(data);
      saveWeightLogsCache(userId, range, data);
    } catch (e) {
      if (cached?.length) {
        setLogs(cached);
        setFromCache(true);
        setError("Could not refresh — showing saved copy from this device.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to load weight logs");
        setLogs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, from, to, limit]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!supabase || !userId) return;
    const ch = supabase
      .channel(`weight_logs:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "weight_logs", filter: `user_id=eq.${userId}` },
        () => void refetch(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase, userId, refetch]);

  return { logs, loading, error, fromCache, refetch };
}
