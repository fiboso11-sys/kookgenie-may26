"use client";

import type { FoodLog } from "@/types/database";
import type { MealType } from "@/types/database";

type Props = {
  mealType: MealType;
  /** Open add flow for this meal; optional template copies macros from an existing log. */
  onAddFood: (meal: MealType, template?: FoodLog) => void;
  /** Recent foods from today’s log (real DB rows). */
  recentLogs: FoodLog[];
};

export function QuickAddButtons({ mealType, onAddFood, recentLogs }: Props) {
  const forMeal = recentLogs.filter((l) => l.meal_type === mealType).slice(0, 3);

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => onAddFood(mealType)}
        className="min-h-11 rounded-full bg-kg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-kg-secondary"
      >
        + Add
      </button>
      {forMeal.map((log) => (
        <button
          key={log.id}
          type="button"
          title={`Repeat ${log.food_name}`}
          onClick={() => onAddFood(mealType, log)}
          className="max-w-[140px] min-h-11 truncate rounded-full border border-kg-border bg-kg-surface px-3 text-xs font-medium text-kg-foreground hover:bg-kg-surface/90 dark:hover:bg-white/5"
        >
          Repeat: {log.food_name}
        </button>
      ))}
    </div>
  );
}
