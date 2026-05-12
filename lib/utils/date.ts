/** Start of calendar day in the user's local timezone, as ISO string (for Supabase `timestamptz` filters). */
export function startOfLocalDayISO(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

/** End of calendar day in the user's local timezone, as ISO string. */
export function endOfLocalDayISO(d: Date): string {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

export function toDateInputValue(d: Date): string {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateInputValue(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Local calendar day key `yyyy-mm-dd` from an ISO timestamp. */
export function localDayKeyFromISO(iso: string): string {
  return toDateInputValue(new Date(iso));
}

export function addLocalDays(d: Date, delta: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
}
