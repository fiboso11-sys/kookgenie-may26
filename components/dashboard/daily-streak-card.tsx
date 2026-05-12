"use client";

import { milestonesReached, type Milestone } from "@/lib/streaks";

type Props = {
  foodStreak: number;
  waterStreak: number;
  weightStreak: number;
};

function Row({ label, days }: { label: string; days: number }) {
  const ms = milestonesReached(days);
  return (
    <div className="rounded-xl border border-kg-border bg-kg-surface px-4 py-3 dark:bg-black/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-kg-subtle">{label}</p>
      <p className="mt-1 text-2xl font-bold text-kg-secondary">{days}</p>
      {ms.length > 0 ? (
        <p className="mt-2 text-[11px] font-medium text-kg-primary">
          {ms.map((m: Milestone) => m.label).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

export function DailyStreakCard({ foodStreak, waterStreak, weightStreak }: Props) {
  return (
    <div className="kg-card p-5">
      <h2 className="text-sm font-semibold text-kg-secondary">Streaks</h2>
      <p className="mt-1 text-xs leading-relaxed text-kg-muted">
        Consecutive local days with at least one log (computed from your data).
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Row label="Calories logged" days={foodStreak} />
        <Row label="Hydration" days={waterStreak} />
        <Row label="Weight" days={weightStreak} />
      </div>
    </div>
  );
}
