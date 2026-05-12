"use client";

type Props = {
  currentKg: number | null;
  targetKg: number | null;
};

/**
 * Progress toward target using only current vs target (no AI).
 * 100% when equal; otherwise scales by relative distance.
 */
export function GoalProgress({ currentKg, targetKg }: Props) {
  if (currentKg == null || targetKg == null) {
    return (
      <div className="kg-card p-5">
        <h3 className="text-sm font-semibold text-kg-secondary">Goal progress</h3>
        <p className="mt-2 text-sm leading-relaxed text-kg-muted">Log weight and set target weight in health settings.</p>
      </div>
    );
  }

  const d = Math.abs(currentKg - targetKg);
  const norm = Math.max(Math.abs(currentKg), Math.abs(targetKg), 1);
  const closeness = 1 - Math.min(1, d / norm);
  const pct = Math.round(closeness * 100);

  return (
    <div className="kg-card p-5">
      <h3 className="text-sm font-semibold text-kg-secondary">Toward target</h3>
      <p className="mt-1 text-xs leading-relaxed text-kg-muted">
        Current {currentKg} kg · goal {targetKg} kg · {d.toFixed(1)} kg away
      </p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-kg-surface dark:bg-white/10">
        <div className="h-full rounded-full bg-kg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm font-semibold text-kg-secondary">{pct}%</p>
    </div>
  );
}
