"use client";

import type { ParsedFoodItem } from "@/lib/ai/schemas";
import type { MealType } from "@/types/database";

type Props = {
  items: ParsedFoodItem[];
  mealType: MealType;
  onApply: (item: ParsedFoodItem, meal: MealType) => void;
};

export function AiResultsCard({ items, mealType, onApply }: Props) {
  if (!items.length) return null;

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={`${item.food_name}-${i}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/8 bg-white px-3 py-2.5 text-sm shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-kg-neutral-800">{item.food_name}</p>
            <p className="text-xs text-kg-neutral-800/65">
              {item.calories} kcal · P{item.protein} · C{item.carbs} · F{item.fat}
              {item.quantity && item.quantity !== 1 ? ` · ×${item.quantity}` : null}
            </p>
            {item.notes ? <p className="mt-1 text-xs text-kg-neutral-800/55">{item.notes}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => onApply(item, mealType)}
            className="shrink-0 rounded-lg bg-kg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-kg-secondary"
          >
            Add to log
          </button>
        </li>
      ))}
    </ul>
  );
}
