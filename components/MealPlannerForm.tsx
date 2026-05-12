"use client";

import { FormEvent, useState } from "react";
import { useGrocery } from "@/components/GroceryContext";
import type { MealPlanDay } from "@/lib/meal-plan-types";

export function MealPlannerForm() {
  const { addItems } = useGrocery();
  const [dietType, setDietType] = useState("Mediterranean");
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [fitnessGoal, setFitnessGoal] = useState("Maintain weight");
  const [plan, setPlan] = useState<MealPlanDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dietType, calorieTarget, fitnessGoal }),
      });
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan as MealPlanDay);
        setDemo(Boolean(data.demo));
      }
    } finally {
      setLoading(false);
    }
  }

  function addPlanToGrocery() {
    if (!plan) return;
    const rough = [plan.breakfast, plan.lunch, plan.dinner, plan.snacks]
      .join(" ")
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 48);
    addItems(rough.slice(0, 12));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div>
          <label className="text-sm font-semibold text-kg-neutral-800">Diet type</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 bg-kg-neutral-100 px-3 py-2 text-sm outline-none focus:border-kg-primary"
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-kg-neutral-800">Calorie target (daily)</label>
          <input
            type="number"
            min={1200}
            max={4000}
            className="mt-1 w-full rounded-xl border border-black/10 bg-kg-neutral-100 px-3 py-2 text-sm outline-none focus:border-kg-primary"
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-kg-neutral-800">Fitness goal</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 bg-kg-neutral-100 px-3 py-2 text-sm outline-none focus:border-kg-primary"
            value={fitnessGoal}
            onChange={(e) => setFitnessGoal(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-kg-secondary py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Planning…" : "Generate day plan"}
        </button>
        {demo && plan && (
          <p className="text-xs text-kg-neutral-800/60">Demo template — OpenAI returns tailored plans when configured.</p>
        )}
      </form>

      {plan && (
        <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-kg-neutral-800">
              Your day
            </h2>
            <button
              type="button"
              onClick={addPlanToGrocery}
              className="rounded-xl bg-kg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Add hints to grocery list
            </button>
          </div>
          {(["breakfast", "lunch", "dinner", "snacks"] as const).map((key) => (
            <div key={key} className="rounded-xl bg-kg-neutral-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-kg-secondary">{key}</p>
              <p className="mt-1 text-sm text-kg-neutral-800/85">{plan[key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
