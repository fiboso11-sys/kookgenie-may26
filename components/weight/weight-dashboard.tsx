"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useWeightLogs } from "@/hooks/use-weight-logs";
import { useHealthSettings } from "@/hooks/use-health-settings";
import { addLocalDays, endOfLocalDayISO, startOfLocalDayISO } from "@/lib/utils/date";
import { bmiKg, latestWeight } from "@/lib/health-analytics";
import type { WeightLog } from "@/types/database";
import { toast } from "@/lib/toast";
import { WeightChart } from "@/components/weight/weight-chart";
import { BmiCard } from "@/components/weight/bmi-card";
import { GoalProgress } from "@/components/weight/goal-progress";
import { WeightHistory } from "@/components/weight/weight-history";
import { AddWeightModal } from "@/components/weight/add-weight-modal";
import { pwaMutateFetch } from "@/lib/offline/pwa-fetch";

export function WeightDashboard() {
  const { user, loading: authLoading, supabase } = useSupabaseAuth();
  const now = useMemo(() => new Date(), []);
  const range = useMemo(() => {
    const from = startOfLocalDayISO(addLocalDays(now, -180));
    const to = endOfLocalDayISO(now);
    return { from, to };
  }, [now]);

  const { logs, loading, error, refetch } = useWeightLogs(user?.id ?? null, supabase, range);
  const { settings, reload } = useHealthSettings(Boolean(user));

  useEffect(() => {
    const onSync = () => {
      void refetch();
      void reload();
    };
    window.addEventListener("kg-pwa-synced", onSync);
    return () => window.removeEventListener("kg-pwa-synced", onSync);
  }, [refetch, reload]);

  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<WeightLog | null>(null);

  const lw = useMemo(() => latestWeight(logs), [logs]);
  const bmi = useMemo(() => bmiKg(settings?.height ?? null, lw), [settings?.height, lw]);

  const saveWeight = useCallback(
    async (weight: number, id?: string) => {
      if (id) {
        const res = await pwaMutateFetch(`/api/weight-logs/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weight }),
        });
        if (res.status === 202) {
          toast.success("Weight update queued — will sync online");
          return;
        }
        const j = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? "Update failed");
      } else {
        const res = await pwaMutateFetch("/api/weight-logs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weight }),
        });
        if (res.status === 202) {
          toast.success("Weight queued — will sync online");
          return;
        }
        const j = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? "Save failed");
      }
      await refetch();
      await reload();
      toast.success("Weight saved");
    },
    [refetch, reload],
  );

  const del = useCallback(
    async (id: string) => {
      const res = await pwaMutateFetch(`/api/weight-logs/${id}`, { method: "DELETE", credentials: "include" });
      if (res.status === 202) {
        toast.success("Delete queued — will sync online");
        return;
      }
      if (!res.ok && res.status !== 204) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "Delete failed");
      }
      await refetch();
      toast.success("Deleted");
    },
    [refetch],
  );

  if (authLoading) return <div className="h-40 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />;
  if (!user) {
    return (
      <div className="kg-card p-6">
        <p className="text-sm leading-relaxed text-kg-muted">Sign in to track weight.</p>
        <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-kg-primary hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-kg-foreground">Weight</h1>
          <p className="mt-1 text-sm leading-relaxed text-kg-muted">Logs in kg · charts from your history.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEdit(null);
            setModalOpen(true);
          }}
          className="min-h-12 rounded-2xl bg-kg-primary px-4 text-sm font-bold text-white shadow-sm hover:bg-kg-secondary"
        >
          Log weight
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <BmiCard bmi={bmi} heightCm={settings?.height ?? null} weightKg={lw} />
        <GoalProgress currentKg={lw} targetKg={settings?.target_weight ?? null} />
      </div>

      <div className="kg-card p-4">
        <h2 className="text-sm font-semibold text-kg-secondary">Trend</h2>
        <div className="mt-3">
          <WeightChart logs={logs} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-kg-secondary">History</h2>
        <WeightHistory
          logs={logs}
          onEdit={(l) => {
            setEdit(l);
            setModalOpen(true);
          }}
          onDelete={(id) => void del(id).catch((e) => toast.error(e instanceof Error ? e.message : "Error"))}
        />
      </div>

      <AddWeightModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEdit(null);
        }}
        edit={edit}
        onSave={saveWeight}
      />

      <div className="kg-card p-5">
        <h2 className="text-sm font-semibold text-kg-secondary">BMI inputs (profile)</h2>
        <p className="mt-1 text-xs leading-relaxed text-kg-muted">Height (cm) and target weight (kg) are stored in Supabase for BMI and goal bars.</p>
        <BodyTargetsForm
          key={`${settings?.height ?? ""}-${settings?.target_weight ?? ""}`}
          height={settings?.height ?? null}
          target={settings?.target_weight ?? null}
          onSaved={() => void reload()}
        />
      </div>

      {loading && logs.length === 0 ? <p className="text-sm text-kg-muted">Loading…</p> : null}
    </div>
  );
}

function BodyTargetsForm({
  height,
  target,
  onSaved,
}: {
  height: number | null;
  target: number | null;
  onSaved: () => void;
}) {
  const [h, setH] = useState(height != null ? String(height) : "");
  const [t, setT] = useState(target != null ? String(target) : "");
  const [busy, setBusy] = useState(false);

  async function save() {
    const payload: Record<string, number> = {};
    const hn = Number.parseFloat(h);
    const tn = Number.parseFloat(t);
    if (h.trim() && Number.isFinite(hn)) payload.height = hn;
    if (t.trim() && Number.isFinite(tn)) payload.target_weight = tn;
    if (Object.keys(payload).length === 0) return;
    setBusy(true);
    try {
      const res = await pwaMutateFetch("/api/user/health-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 202) {
        toast.success("Profile update queued — will sync online");
        return;
      }
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Save failed");
      await onSaved();
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <label className="text-xs font-medium text-kg-foreground">
        Height (cm)
        <input
          className="mt-1 min-h-11 w-32 rounded-xl border border-kg-border bg-kg-input px-2 text-sm text-kg-foreground"
          value={h}
          onChange={(e) => setH(e.target.value)}
        />
      </label>
      <label className="text-xs font-medium text-kg-foreground">
        Target weight (kg)
        <input
          className="mt-1 min-h-11 w-32 rounded-xl border border-kg-border bg-kg-input px-2 text-sm text-kg-foreground"
          value={t}
          onChange={(e) => setT(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="mt-5 min-h-11 self-end rounded-xl bg-kg-secondary px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}
