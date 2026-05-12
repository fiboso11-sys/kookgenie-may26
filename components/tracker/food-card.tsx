"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FoodLog } from "@/types/database";
import { cn } from "@/lib/utils";

type Props = {
  log: FoodLog;
  onEdit: (log: FoodLog) => void;
  onRequestDelete: (log: FoodLog) => void;
};

export function FoodCard({ log, onEdit, onRequestDelete }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-2xl border border-kg-border bg-kg-elevated shadow-sm"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: -88, right: 0 }}
        dragElastic={0.08}
        className="touch-pan-y"
      >
        <div className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-kg-foreground">{log.food_name}</p>
            <p className="mt-0.5 text-xs text-kg-muted">
              {log.calories} kcal · qty {log.quantity} · P {Number(log.protein)} · C {Number(log.carbs)} · F{" "}
              {Number(log.fat)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(log)}
              className="min-h-11 min-w-11 rounded-xl border border-black/10 px-2 text-xs font-semibold text-kg-primary hover:bg-kg-neutral-100"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(log)}
              className="min-h-11 min-w-11 rounded-xl border border-red-300 bg-kg-elevated px-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Del
            </button>
          </div>
        </div>
        <p className="px-4 pb-2 text-[11px] leading-snug text-kg-subtle">Drag card slightly to feel motion; Edit and Delete are always one tap.</p>
      </motion.div>
    </motion.div>
  );
}

export function FoodCardSkeleton({ className }: { className?: string }) {
  return <div className={cn("h-[72px] animate-pulse rounded-2xl bg-black/10", className)} />;
}
