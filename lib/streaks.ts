import { addLocalDays, parseDateInputValue, toDateInputValue } from "@/lib/utils/date";

/** Unique local day keys (`yyyy-mm-dd`) from ISO timestamps. */
export function activeDayKeysFromISOs(isoDates: string[]): Set<string> {
  return new Set(isoDates.map((iso) => toDateInputValue(new Date(iso))));
}

/** Count consecutive days in `active` walking backward from `endKey` (inclusive). */
export function streakEndingOn(active: Set<string>, endKey: string): number {
  let count = 0;
  let cur = parseDateInputValue(endKey);
  for (;;) {
    const key = toDateInputValue(cur);
    if (!active.has(key)) break;
    count += 1;
    cur = addLocalDays(cur, -1);
  }
  return count;
}

/**
 * Logging streak ending today or yesterday (grace if you have not logged yet today
 * but did log yesterday — still counts from yesterday’s chain).
 */
export function loggingStreakFromDays(active: Set<string>, now = new Date()): number {
  const todayKey = toDateInputValue(now);
  if (active.has(todayKey)) return streakEndingOn(active, todayKey);
  const y = addLocalDays(now, -1);
  const yKey = toDateInputValue(y);
  if (active.has(yKey)) return streakEndingOn(active, yKey);
  return 0;
}

export type Milestone = { days: number; label: string };

export const STREAK_MILESTONES: Milestone[] = [
  { days: 3, label: "3-day run" },
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 30, label: "1 month" },
  { days: 60, label: "2 months" },
  { days: 100, label: "100 days" },
];

export function milestonesReached(streak: number): Milestone[] {
  return STREAK_MILESTONES.filter((m) => streak >= m.days);
}
