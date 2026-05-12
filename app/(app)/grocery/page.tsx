"use client";

import { useGrocery } from "@/components/GroceryContext";

export default function GroceryPage() {
  const { items, removeItem, clear } = useGrocery();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">Grocery List</h1>
          <p className="mt-2 text-kg-neutral-800/70">
            Items are added from recipe pages, the AI generator, and meal planner hints (local storage).
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-kg-neutral-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        {items.length === 0 ? (
          <p className="text-sm text-kg-neutral-800/60">
            Your list is empty. Tap <strong>Buy ingredients</strong> on a recipe or generate a meal plan.
          </p>
        ) : (
          <ul className="divide-y divide-black/5">
            {items.map((item) => (
              <li key={item} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-medium text-kg-neutral-800">{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="text-xs font-semibold text-kg-accent hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
