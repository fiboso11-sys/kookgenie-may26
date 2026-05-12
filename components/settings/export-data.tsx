"use client";

import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { toast } from "@/lib/toast";

export function ExportData() {
  const { user } = useSupabaseAuth();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!user) {
      toast.error("Sign in to export");
      return;
    }
    setBusy(true);
    try {
      const [food, water, weight, goals] = await Promise.all([
        fetch("/api/food-logs?limit=500", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/water-logs?limit=500", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/weight-logs?limit=500", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/user/goals", { credentials: "include" }).then((r) => r.json()),
      ]);

      const blob = new Blob(
        [
          JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              userId: user.id,
              goals: goals?.data ?? null,
              food_logs: food?.data ?? [],
              water_logs: water?.data ?? [],
              weight_logs: weight?.data ?? [],
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kookgenie-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-kg-neutral-800/80">
      <h2 className="text-sm font-semibold text-kg-secondary">Export data</h2>
      <p className="mt-1 text-xs text-kg-neutral-800/60 dark:text-white/65">
        Download a JSON snapshot of recent logs and goals from this device (requires connection).
      </p>
      <button
        type="button"
        disabled={busy || !user}
        onClick={() => void run()}
        className="mt-4 min-h-11 rounded-xl bg-kg-primary px-4 text-sm font-semibold text-white hover:bg-kg-secondary disabled:opacity-50"
      >
        {busy ? "Preparing…" : "Export JSON"}
      </button>
    </div>
  );
}
