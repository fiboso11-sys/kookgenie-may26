import type { FoodDatabaseRow } from "@/types/database";
import { nutritionRowForScaling, servingScaleFactor } from "@/lib/nutrition/serving-converter";

export type NutritionBase = Pick<
  FoodDatabaseRow,
  "calories" | "protein" | "carbs" | "fat" | "reference_amount" | "reference_unit" | "serving_size" | "name"
> & { food_name?: string | null };

export type LogMacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
};

/**
 * Converts reference macros + user amount into totals for a single `food_logs` row
 * (this app stores totals in calories/protein/carbs/fat; `quantity` is the scale factor).
 */
function coerceNutritionBase(base: NutritionBase): NutritionBase {
  const scaled = nutritionRowForScaling({
    reference_unit: String(base.reference_unit ?? "g"),
    reference_amount: Number(base.reference_amount),
    serving_size: String(base.serving_size ?? ""),
    name: base.name,
    food_name: base.food_name,
    calories: Number(base.calories),
  });
  const refAmt = scaled.reference_amount;
  const unit = scaled.reference_unit;
  return {
    calories: Number(base.calories) || 0,
    protein: Number(base.protein) || 0,
    carbs: Number(base.carbs) || 0,
    fat: Number(base.fat) || 0,
    reference_amount: Number.isFinite(refAmt) && refAmt > 0 ? refAmt : 1,
    reference_unit: unit,
    serving_size: String(base.serving_size ?? ""),
    name: String(base.name ?? ""),
    food_name: base.food_name ?? null,
  };
}

export function calculateLogTotalsFromFood(base: NutritionBase, userAmount: number): LogMacroTotals {
  const b = coerceNutritionBase(base);
  const factor = servingScaleFactor(Number(b.reference_amount), b.reference_unit, userAmount);
  if (factor <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, quantity: 1 };
  }

  const c = Math.round(Number(b.calories) * factor);
  const p = Math.round(Number(b.protein) * factor * 10) / 10;
  const carbs = Math.round(Number(b.carbs) * factor * 10) / 10;
  const f = Math.round(Number(b.fat) * factor * 10) / 10;
  const q = Math.round(factor * 100) / 100;

  return {
    calories: Math.min(30_000, Math.max(0, c)),
    protein: Math.min(2000, Math.max(0, p)),
    carbs: Math.min(2000, Math.max(0, carbs)),
    fat: Math.min(2000, Math.max(0, f)),
    quantity: Math.min(10_000, Math.max(0.01, q)),
  };
}

export function defaultUserAmountForUnit(row: FoodDatabaseRow): number {
  const scaled = nutritionRowForScaling({
    ...row,
    food_name: (row as FoodDatabaseRow & { food_name?: string | null }).food_name,
  });
  const u = scaled.reference_unit;
  const ref = scaled.reference_amount;
  if (u === "g" || u === "ml") return (Number.isFinite(ref) && ref > 0 ? ref : 100) || 100;
  return Number.isFinite(ref) && ref > 0 ? ref : 1;
}
