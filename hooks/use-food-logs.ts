"use client";

import { useCallback, useEffect, useState } from "react";
import type { FoodLog } from "@/types/database";
import type { BrowserSupabaseClient } from "@/lib/supabase/server-types";
import { readFoodLogsCache, saveFoodLogsCache } from "@/lib/offline/log-cache";

type ListParams = { from?: string; to?: string; limit?: number };

/**
 * Fetches food logs via the authenticated API route (cookie session).
 * Subscribes to Supabase Realtime on `food_logs` when `supabase` + `userId` are available.
 */
export function useFoodLogs(
  userId: string | null,
  supabase: BrowserSupabaseClient | null,
  params: ListParams | null | undefined = {},
) {
  const { from, to, limit } = params ?? {};

  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      setFromCache(false);
      setError(null);
      return;
    }
    const listParams: ListParams = { from, to, limit };
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    const cached = readFoodLogsCache(userId, listParams);
    if (offline) {
      if (cached?.length) {
        setLogs(cached);
        setFromCache(true);
        setError("Offline — showing last saved meals on this device.");
      } else {
        setLogs([]);
        setFromCache(false);
        setError("Offline — no saved meals on this device yet.");
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

      const res = await fetch(`/api/food-logs?${sp.toString()}`, { credentials: "include" });
      const json = (await res.json()) as { data?: FoodLog[]; error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? res.statusText);
      }
      const raw = json.data;
      const data = Array.isArray(raw) ? raw : [];
      setLogs(data);
      saveFoodLogsCache(userId, listParams, data);
    } catch (e) {
      if (cached?.length) {
        setLogs(cached);
        setFromCache(true);
        setError("Could not refresh — showing saved copy from this device.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to load food logs");
        setLogs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, from, to, limit]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!userId) return;
    const onFoodLogsUpdated = () => {
      void fetchLogs();
    };
    window.addEventListener("kg-food-logs-updated", onFoodLogsUpdated);
    return () => window.removeEventListener("kg-food-logs-updated", onFoodLogsUpdated);
  }, [userId, fetchLogs]);

  useEffect(() => {
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`food_logs_feed:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_logs", filter: `user_id=eq.${userId}` },
        () => {
          void fetchLogs();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId, fetchLogs]);

  useEffect(() => {
    if (!userId) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      clearTimeout(t);
      t = setTimeout(() => void fetchLogs(), 450);
    };
    window.addEventListener("visibilitychange", schedule);
    window.addEventListener("focus", schedule);
    return () => {
      window.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("focus", schedule);
      clearTimeout(t);
    };
  }, [userId, fetchLogs]);

  return { logs, loading, error, fromCache, refetch: fetchLogs };
}
