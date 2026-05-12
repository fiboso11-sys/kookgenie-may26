import type { FoodLog } from "@/types/database";

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function finiteNonNeg(n: unknown): number {
  const x = Number(n);
  return Number.isFinite(x) && x >= 0 ? x : 0;
}

function finiteIntNonNeg(n: unknown): number {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 0) return 0;
  return Math.round(x);
}

export function sumFoodLogs(logs: FoodLog[]): MacroTotals {
  if (!Array.isArray(logs)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  return logs.reduce(
    (acc, l) => {
      acc.calories += finiteIntNonNeg(l.calories);
      acc.protein += finiteNonNeg(l.protein);
      acc.carbs += finiteNonNeg(l.carbs);
      acc.fat += finiteNonNeg(l.fat);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function groupLogsByMeal(logs: FoodLog[]) {
  if (!Array.isArray(logs)) {
    return {
      breakfast: [] as FoodLog[],
      lunch: [] as FoodLog[],
      dinner: [] as FoodLog[],
      snack: [] as FoodLog[],
    };
  }
  const map = {
    breakfast: [] as FoodLog[],
    lunch: [] as FoodLog[],
    dinner: [] as FoodLog[],
    snack: [] as FoodLog[],
  };
  for (const log of logs) {
    const key = log.meal_type as keyof typeof map;
    if (key in map) map[key].push(log);
  }
  return map;
}

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
