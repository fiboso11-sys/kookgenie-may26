"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  currentMl: number;
  goalMl: number | null;
};

export function WaterProgressRing({ currentMl, goalMl }: Props) {
  const reduce = useReducedMotion();
  const R = 44;
  const C = 2 * Math.PI * R;
  const pct = goalMl != null && goalMl > 0 ? Math.min(1, currentMl / goalMl) : 0;
  const offset = C * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" className="stroke-kg-ring-track" strokeWidth="12" />
        {goalMl != null && goalMl > 0 ? (
          <motion.circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={reduce ? { strokeDashoffset: offset } : { strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduce ? 0 : 0.55, ease: "easeOut" }}
          />
        ) : null}
      </svg>
      <p className="text-center text-xs leading-snug text-kg-muted">
        {goalMl != null && goalMl > 0 ? (
          <>
            <span className="text-lg font-bold text-kg-secondary">{currentMl}</span> / {goalMl} ml
          </>
        ) : (
          <>Set a daily water goal in settings below</>
        )}
      </p>
    </div>
  );
}
