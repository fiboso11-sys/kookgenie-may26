"use client";

import { motion, useReducedMotion } from "framer-motion";
import { clamp01, type MacroTotals } from "@/lib/utils/nutrition";
import type { DailyGoals } from "@/hooks/use-tracker-goals";

type Props = {
  totals: MacroTotals;
  goals: DailyGoals | null;
};

const R = 40;
const C = 2 * Math.PI * R;

function Ring({
  label,
  value,
  goal,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  goal: number | null | undefined;
  color: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const progress = goal && goal > 0 ? clamp01(value / goal) : 0;
  const offset = C * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          className="stroke-kg-ring-track"
          strokeWidth="10"
        />
        {goal != null && goal > 0 ? (
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={reduceMotion ? { strokeDashoffset: offset } : { strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: "easeOut", delay }}
          />
        ) : null}
      </svg>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-kg-subtle">{label}</span>
      <span className="text-sm font-bold text-kg-secondary">
        {Math.round(value)}
        {goal != null && goal > 0 ? (
          <span className="font-medium text-kg-muted"> / {Math.round(goal)}</span>
        ) : null}
      </span>
    </div>
  );
}

export function MacroRings({ totals, goals }: Props) {
  return (
    <div className="kg-card p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-kg-secondary">Macro progress</h2>
      <p className="mt-1 text-xs leading-relaxed text-kg-muted">Targets come from your profile goals (not estimates).</p>
      <div className="mt-4 flex flex-wrap justify-center gap-6 sm:justify-between sm:gap-4">
        <Ring label="Calories" value={totals.calories} goal={goals?.daily_calorie_goal} color="#16a34a" delay={0} />
        <Ring label="Protein" value={totals.protein} goal={goals?.daily_protein_goal_g} color="#065f46" delay={0.05} />
        <Ring label="Carbs" value={totals.carbs} goal={goals?.daily_carbs_goal_g} color="#f97316" delay={0.1} />
        <Ring label="Fat" value={totals.fat} goal={goals?.daily_fat_goal_g} color="#d97706" delay={0.15} />
      </div>
    </div>
  );
}
