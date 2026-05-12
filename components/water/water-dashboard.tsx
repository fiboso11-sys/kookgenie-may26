"use client";

import { useCallback, useEffect, useMemo, useOptimistic, startTransition, useState } from "react";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWaterLogs } from "@/hooks/use-water-logs";
import { useHealthSettings } from "@/hooks/use-health-settings";
import { addLocalDays, endOfLocalDayISO, startOfLocalDayISO, toDateInputValue } from "@/lib/utils/date";
import { totalWaterMlToday } from "@/lib/health-analytics";
import { activeDayKeysFromISOs, loggingStreakFromDays } from "@/lib/streaks";
import type { WaterLog } from "@/types/database";
import { toast } from "@/lib/toast";
import { WaterProgressRing } from "@/components/water/water-progress-ring";
import { QuickWaterButtons } from "@/components/water/quick-water-buttons";
import { CustomWaterInput } from "@/components/water/custom-water-input";
import { HydrationStats } from "@/components/water/hydration-stats";
import { HydrationHistory } from "@/components/water/hydration-history";
import { motion, AnimatePresence } from "framer-motion";
import { pwaMutateFetch } from "@/lib/offline/pwa-fetch";

function mergeWater(state: WaterLog[], action: { type: "add"; row: WaterLog } | { type: "del"; id: string }): WaterLog[] {
  if (action.type === "add") return [action.row, ...state.filter((r) => r.id !== action.row.id)];
  return state.filter((r) => r.id !== action.id);
}

export function WaterDashboard() {
  const { user, loading: authLoading, supabase } = useSupabaseAuth();
  const now = useMemo(() => new Date(), []);
  const range = useMemo(() => {
    const from = startOfLocalDayISO(addLocalDays(now, -30));
    const to = endOfLocalDayISO(now);
    return { from, to };
  }, [now]);

  const { logs, loading, error, refetch } = useWaterLogs(user?.id ?? null, supabase, range);
  const { settings, loading: setLoading, reload } = useHealthSettings(Boolean(user));

  useEffect(() => {
    const onSync = () => {
      void refetch();
      void reload();
    };
    window.addEventListener("kg-pwa-synced", onSync);
    return () => window.removeEventListener("kg-pwa-synced", onSync);
  }, [refetch, reload]);

  const [display, addOpt] = useOptimistic(logs, mergeWater);
  const todayKey = toDateInputValue(new Date());
  const todayMl = useMemo(() => totalWaterMlToday(display, todayKey), [display, todayKey]);
  const todayEntries = useMemo(() => display.filter((l) => toDateInputValue(new Date(l.created_at)) === todayKey), [display, todayKey]);
  const streak = useMemo(() => {
    const keys = activeDayKeysFromISOs(display.map((l) => l.created_at));
    return loggingStreakFromDays(keys);
  }, [display]);

  const addWater = useCallback(
    async (amount_ml: number) => {
      if (!user) return;
      const temp: WaterLog = {
        id: `pending:${crypto.randomUUID()}`,
        user_id: user.id,
        amount_ml,
        created_at: new Date().toISOString(),
      };
      startTransition(() => addOpt({ type: "add", row: temp }));
      try {
        const res = await pwaMutateFetch("/api/water-logs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount_ml }),
        });
        if (res.status === 202) {
          toast.success(`+${amount_ml} ml queued — will sync online`);
          return;
        }
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error ?? res.statusText);
        await refetch();
        toast.success(`+${amount_ml} ml`);
      } catch (e) {
        await refetch();
        toast.error(e instanceof Error ? e.message : "Could not save");
      }
    },
    [user, addOpt, refetch],
  );

  const delWater = useCallback(
    async (id: string) => {
      if (id.startsWith("pending:")) return;
      startTransition(() => addOpt({ type: "del", id }));
      try {
        const res = await pwaMutateFetch(`/api/water-logs/${id}`, { method: "DELETE", credentials: "include" });
        if (res.status === 202) {
          toast.success("Remove queued — will sync online");
          return;
        }
        if (!res.ok && res.status !== 204) {
          const j = (await res.json()) as { error?: string };
          throw new Error(j.error ?? res.statusText);
        }
        await refetch();
        toast.success("Removed");
      } catch (e) {
        await refetch();
        toast.error(e instanceof Error ? e.message : "Delete failed");
      }
    },
    [addOpt, refetch],
  );

  async function saveGoal(ml: number) {
    const res = await pwaMutateFetch("/api/user/health-settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daily_water_goal_ml: ml }),
    });
    if (res.status === 202) {
      toast.success("Goal queued — will sync online");
      return;
    }
    const j = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(j.error ?? "Save failed");
    await reload();
    toast.success("Water goal saved");
  }

  if (authLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />;
  }
  if (!user) {
    return (
      <div className="kg-card p-6">
        <p className="text-sm leading-relaxed text-kg-muted">Sign in to track hydration.</p>
        <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-kg-primary hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const goal = settings?.daily_water_goal_ml ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div>
        <h1 className="text-3xl font-bold text-kg-foreground">Water</h1>
        <p className="mt-1 text-sm leading-relaxed text-kg-muted">All volumes stored in Supabase (ml). Realtime sync enabled.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="kg-card flex flex-wrap items-center justify-between gap-4 p-5">
        <WaterProgressRing currentMl={todayMl} goalMl={goal} />
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-kg-subtle">Hydration streak</p>
          <p className="text-3xl font-bold text-kg-secondary">{streak}</p>
          <p className="text-xs text-kg-subtle">consecutive days with water logged</p>
        </div>
      </div>

      <HydrationStats todayMl={todayMl} goalMl={goal} entriesToday={todayEntries.length} />

      <div className="kg-card p-5">
        <h2 className="text-sm font-semibold text-kg-secondary">Quick add</h2>
        <div className="mt-3 space-y-4">
          <QuickWaterButtons disabled={loading} onAdd={(ml) => void addWater(ml)} />
          <CustomWaterInput disabled={loading} onAdd={(ml) => void addWater(ml)} />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-sky-400/80 bg-kg-elevated p-4 text-kg-foreground shadow-sm dark:border-sky-600/50">
        <label className="text-sm font-semibold text-kg-secondary">Daily water goal (ml)</label>
        <GoalForm
          key={goal ?? "none"}
          initial={goal}
          loading={setLoading}
          onSave={(ml) => void saveGoal(ml).catch((e) => toast.error(e instanceof Error ? e.message : "Save failed"))}
        />
      </div>

      <HydrationHistory logs={display} onDelete={(id) => void delWater(id)} />

      <AnimatePresence>
        {goal != null && todayMl >= goal ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          >
            Daily hydration goal reached — great work.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function GoalForm({
  initial,
  loading,
  onSave,
}: {
  initial: number | null;
  loading: boolean;
  onSave: (ml: number) => void;
}) {
  const [v, setV] = useState(initial != null ? String(initial) : "");

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <input
        type="number"
        className="min-h-11 min-w-[160px] flex-1 rounded-xl border border-kg-border bg-kg-input px-3 text-sm text-kg-foreground"
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="e.g. 2500"
        min={500}
        max={20000}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          const n = Number.parseInt(v, 10);
          if (!Number.isFinite(n) || n < 500) return;
          onSave(n);
        }}
        className="min-h-11 rounded-xl bg-kg-primary px-4 text-sm font-semibold text-white hover:bg-kg-secondary disabled:opacity-50"
      >
        Save goal
      </button>
    </div>
  );
}
