import type { FoodLog } from "@/types/database";
import type { WaterLog } from "@/types/database";
import type { WeightLog } from "@/types/database";
import { localDayKeyFromISO } from "@/lib/utils/date";
import { sumFoodLogs } from "@/lib/utils/nutrition";

export type DayCalories = { day: string; calories: number };
export type DayWater = { day: string; ml: number };
export type DayWeight = { day: string; weight: number; at: string };

export function caloriesByLocalDay(logs: FoodLog[]): DayCalories[] {
  const map = new Map<string, number>();
  for (const l of logs) {
    const d = localDayKeyFromISO(l.created_at);
    map.set(d, (map.get(d) ?? 0) + l.calories);
  }
  return [...map.entries()]
    .map(([day, calories]) => ({ day, calories }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function waterMlByLocalDay(logs: WaterLog[]): DayWater[] {
  const map = new Map<string, number>();
  for (const l of logs) {
    const d = localDayKeyFromISO(l.created_at);
    map.set(d, (map.get(d) ?? 0) + l.amount_ml);
  }
  return [...map.entries()]
    .map(([day, ml]) => ({ day, ml }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

/** Latest weight per local day (last entry wins). */
export function weightByLocalDay(logs: WeightLog[]): DayWeight[] {
  const map = new Map<string, { weight: number; at: string }>();
  for (const l of logs) {
    const d = localDayKeyFromISO(l.created_at);
    const prev = map.get(d);
    if (!prev || new Date(l.created_at) >= new Date(prev.at)) {
      map.set(d, { weight: Number(l.weight), at: l.created_at });
    }
  }
  return [...map.entries()]
    .map(([day, v]) => ({ day, weight: v.weight, at: v.at }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function totalWaterMlToday(logs: WaterLog[], dayKey: string): number {
  return logs.filter((l) => localDayKeyFromISO(l.created_at) === dayKey).reduce((s, l) => s + l.amount_ml, 0);
}

export function totalCaloriesForLogs(logs: FoodLog[]): number {
  return sumFoodLogs(logs).calories;
}

export function latestWeight(logs: WeightLog[]): number | null {
  if (!logs.length) return null;
  const sorted = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return Number(sorted[0].weight);
}

/** BMI from mass (kg) and height (cm). */
export function bmiKg(heightCm: number | null | undefined, weightKg: number | null | undefined): number | null {
  if (heightCm == null || weightKg == null) return null;
  const hM = heightCm / 100;
  if (hM <= 0) return null;
  const v = weightKg / (hM * hM);
  if (!Number.isFinite(v)) return null;
  return Math.round(v * 10) / 10;
}
