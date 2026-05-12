import type { FoodLog } from "@/types/database";
import type { WaterLog } from "@/types/database";
import type { WeightLog } from "@/types/database";

const PREFIX = "kg_cache_v1";

function keyFood(userId: string, from?: string, to?: string, limit?: number) {
  return `${PREFIX}:food:${userId}:${from ?? ""}:${to ?? ""}:${limit ?? ""}`;
}

function keyWater(userId: string, from?: string, to?: string) {
  return `${PREFIX}:water:${userId}:${from ?? ""}:${to ?? ""}`;
}

function keyWeight(userId: string, from?: string, to?: string) {
  return `${PREFIX}:weight:${userId}:${from ?? ""}:${to ?? ""}`;
}

export function saveFoodLogsCache(userId: string, params: { from?: string; to?: string; limit?: number }, logs: FoodLog[]) {
  try {
    localStorage.setItem(keyFood(userId, params.from, params.to, params.limit), JSON.stringify(logs));
  } catch {
    /* quota */
  }
}

export function readFoodLogsCache(
  userId: string,
  params: { from?: string; to?: string; limit?: number },
): FoodLog[] | null {
  try {
    const raw = localStorage.getItem(keyFood(userId, params.from, params.to, params.limit));
    if (!raw) return null;
    const data = JSON.parse(raw) as FoodLog[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function saveWaterLogsCache(userId: string, params: { from?: string; to?: string }, logs: WaterLog[]) {
  try {
    localStorage.setItem(keyWater(userId, params.from, params.to), JSON.stringify(logs));
  } catch {
    /* quota */
  }
}

export function readWaterLogsCache(userId: string, params: { from?: string; to?: string }): WaterLog[] | null {
  try {
    const raw = localStorage.getItem(keyWater(userId, params.from, params.to));
    if (!raw) return null;
    const data = JSON.parse(raw) as WaterLog[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function saveWeightLogsCache(userId: string, params: { from?: string; to?: string }, logs: WeightLog[]) {
  try {
    localStorage.setItem(keyWeight(userId, params.from, params.to), JSON.stringify(logs));
  } catch {
    /* quota */
  }
}

export function readWeightLogsCache(userId: string, params: { from?: string; to?: string }): WeightLog[] | null {
  try {
    const raw = localStorage.getItem(keyWeight(userId, params.from, params.to));
    if (!raw) return null;
    const data = JSON.parse(raw) as WeightLog[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
