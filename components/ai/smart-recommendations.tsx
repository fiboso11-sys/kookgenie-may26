"use client";

import { useCallback, useState } from "react";
import type { DailyGoals } from "@/hooks/use-tracker-goals";
import type { MacroTotals } from "@/lib/utils/nutrition";
import type { ParsedFoodItem } from "@/lib/ai/schemas";
import type { MealType } from "@/types/database";
import { toast } from "@/lib/toast";
import { AiLoadingState } from "@/components/ai/ai-loading-state";

const SCENARIOS = [
  { id: "high_protein", label: "High protein" },
  { id: "weight_loss", label: "Weight loss friendly" },
  { id: "muscle_gain", label: "Muscle gain" },
  { id: "indian_veg", label: "Indian vegetarian" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "calorie_fit", label: "Fit remaining calories" },
] as const;

type Meal = {
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rationale?: string;
};

type Props = {
  totals: MacroTotals;
  goals: DailyGoals | null;
  mealType: MealType;
  onApplyMeal: (item: ParsedFoodItem, meal: MealType) => void;
};

function remaining(goals: DailyGoals | null, totals: MacroTotals) {
  if (!goals) {
    return {
      calories: null as number | null,
      protein: null as number | null,
      carbs: null as number | null,
      fat: null as number | null,
    };
  }
  return {
    calories:
      goals.daily_calorie_goal != null
        ? Math.max(0, goals.daily_calorie_goal - totals.calories)
        : null,
    protein:
      goals.daily_protein_goal_g != null
        ? Math.max(0, goals.daily_protein_goal_g - totals.protein)
        : null,
    carbs:
      goals.daily_carbs_goal_g != null ? Math.max(0, goals.daily_carbs_goal_g - totals.carbs) : null,
    fat: goals.daily_fat_goal_g != null ? Math.max(0, goals.daily_fat_goal_g - totals.fat) : null,
  };
}

export function SmartRecommendations({ totals, goals, mealType, onApplyMeal }: Props) {
  const [scenario, setScenario] = useState<string>(SCENARIOS[0].id);
  const [dietary, setDietary] = useState("");
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [tips, setTips] = useState<string[] | null>(null);

  const rem = remaining(goals, totals);

  const load = useCallback(async () => {
    setLoading(true);
    setMeals(null);
    setTips(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: SCENARIOS.find((s) => s.id === scenario)?.label ?? scenario,
          dietary,
          goal: "",
          caloriesRemaining: rem.calories,
          proteinRemaining: rem.protein,
          carbsRemaining: rem.carbs,
          fatRemaining: rem.fat,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        meals?: Meal[];
        tips?: string[];
      };
      if (!res.ok) throw new Error(json.error ?? res.statusText);
      setMeals(json.meals ?? []);
      setTips(json.tips ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load ideas");
    } finally {
      setLoading(false);
    }
  }, [scenario, dietary, rem.calories, rem.protein, rem.carbs, rem.fat]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-kg-neutral-800/65">
        Uses your today totals vs goals when set. Responses are cached by inputs to save API cost.
      </p>
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenario(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              scenario === s.id
                ? "bg-kg-primary text-white"
                : "border border-black/10 bg-white text-kg-neutral-800"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <input
        value={dietary}
        onChange={(e) => setDietary(e.target.value)}
        placeholder="Dietary notes (e.g. no dairy, vegan)"
        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        maxLength={120}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => void load()}
        className="w-full rounded-xl bg-kg-primary py-2.5 text-sm font-semibold text-white hover:bg-kg-secondary disabled:opacity-50"
      >
        {loading ? "Loading…" : "Get meal ideas"}
      </button>

      {loading ? <AiLoadingState label="Fetching ideas…" /> : null}

      {tips && tips.length > 0 ? (
        <ul className="list-inside list-disc text-xs text-kg-neutral-800/75">
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      ) : null}

      {meals && meals.length > 0 ? (
        <ul className="space-y-2">
          {meals.map((m, i) => (
            <li
              key={`${m.title}-${i}`}
              className="rounded-xl border border-black/8 bg-white px-3 py-2.5 text-sm shadow-sm"
            >
              <p className="font-semibold text-kg-neutral-800">{m.title}</p>
              <p className="text-xs text-kg-neutral-800/65">
                ~{m.calories} kcal · P{m.protein} · C{m.carbs} · F{m.fat}
              </p>
              {m.rationale ? <p className="mt-1 text-xs text-kg-neutral-800/55">{m.rationale}</p> : null}
              <button
                type="button"
                className="mt-2 text-xs font-semibold text-kg-primary hover:underline"
                onClick={() =>
                  onApplyMeal(
                    {
                      food_name: m.title,
                      calories: m.calories,
                      protein: m.protein,
                      carbs: m.carbs,
                      fat: m.fat,
                      quantity: 1,
                    },
                    mealType,
                  )
                }
              >
                Prefill in tracker
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
