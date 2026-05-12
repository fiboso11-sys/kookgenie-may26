"use client";

import { AnimatePresence } from "framer-motion";
import type { FoodLog, MealType } from "@/types/database";
import { FoodCard, FoodCardSkeleton } from "@/components/tracker/food-card";
import { QuickAddButtons } from "@/components/tracker/quick-add-buttons";

const TITLES: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

type Props = {
  mealType: MealType;
  logs: FoodLog[];
  loading: boolean;
  onAddFood: (meal: MealType, template?: FoodLog) => void;
  onEdit: (log: FoodLog) => void;
  onRequestDelete: (log: FoodLog) => void;
  recentTemplates: FoodLog[];
};

export function MealSection({
  mealType,
  logs,
  loading,
  onAddFood,
  onEdit,
  onRequestDelete,
  recentTemplates,
}: Props) {
  return (
    <section className="kg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-kg-secondary">{TITLES[mealType]}</h3>
        <QuickAddButtons mealType={mealType} onAddFood={onAddFood} recentLogs={recentTemplates} />
      </div>

      <div className="mt-3 space-y-2">
        {loading ? (
          <>
            <FoodCardSkeleton />
            <FoodCardSkeleton />
          </>
        ) : logs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-kg-border bg-kg-surface px-4 py-6 text-center text-sm leading-relaxed text-kg-muted">
            Nothing logged for {TITLES[mealType].toLowerCase()} yet.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <FoodCard key={log.id} log={log} onEdit={onEdit} onRequestDelete={onRequestDelete} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
