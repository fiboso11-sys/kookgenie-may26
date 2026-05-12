"use client";

type Props = {
  todayMl: number;
  goalMl: number | null;
  entriesToday: number;
};

export function HydrationStats({ todayMl, goalMl, entriesToday }: Props) {
  const pct = goalMl != null && goalMl > 0 ? Math.round(Math.min(100, (todayMl / goalMl) * 100)) : null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="kg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-kg-subtle">Today</p>
        <p className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">{todayMl} ml</p>
      </div>
      <div className="kg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-kg-subtle">Goal</p>
        <p className="mt-1 text-2xl font-bold text-kg-secondary">{goalMl != null ? `${goalMl} ml` : "—"}</p>
      </div>
      <div className="kg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-kg-subtle">Hydration</p>
        <p className="mt-1 text-2xl font-bold text-kg-foreground">{pct != null ? `${pct}%` : "—"}</p>
        <p className="mt-1 text-xs text-kg-muted">{entriesToday} entries today</p>
      </div>
    </div>
  );
}
