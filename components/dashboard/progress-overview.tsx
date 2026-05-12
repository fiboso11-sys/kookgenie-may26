"use client";

type Props = {
  caloriesConsumed: number;
  calorieGoal: number | null;
  waterMl: number;
  waterGoal: number | null;
  protein: number;
  proteinGoal: number | null;
};

export function ProgressOverview({ caloriesConsumed, calorieGoal, waterMl, waterGoal, protein, proteinGoal }: Props) {
  const calPct =
    calorieGoal != null && calorieGoal > 0 ? Math.min(100, Math.round((caloriesConsumed / calorieGoal) * 100)) : null;
  const waterPct = waterGoal != null && waterGoal > 0 ? Math.min(100, Math.round((waterMl / waterGoal) * 100)) : null;
  const pPct =
    proteinGoal != null && proteinGoal > 0 ? Math.min(100, Math.round((protein / proteinGoal) * 100)) : null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Ring label="Calories" pct={calPct} sub={calorieGoal != null ? `${caloriesConsumed}/${calorieGoal} kcal` : "—"} />
      <Ring label="Water" pct={waterPct} sub={waterGoal != null ? `${waterMl}/${waterGoal} ml` : "—"} />
      <Ring label="Protein" pct={pPct} sub={proteinGoal != null ? `${Math.round(protein)}/${Math.round(proteinGoal)} g` : "—"} />
    </div>
  );
}

function Ring({ label, pct, sub }: { label: string; pct: number | null; sub: string }) {
  return (
    <div className="kg-card p-4 text-center">
      <p className="text-xs font-semibold uppercase text-kg-subtle">{label}</p>
      <div
        className="mx-auto mt-3 h-24 w-24 rounded-full border-8 border-kg-border p-1 dark:border-white/10"
        style={{ borderTopColor: pct != null ? "#16a34a" : undefined }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-kg-surface dark:bg-black/25">
          <span className="text-lg font-bold text-kg-secondary">{pct != null ? `${pct}%` : "—"}</span>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-kg-muted">{sub}</p>
    </div>
  );
}
