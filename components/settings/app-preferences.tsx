"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const UNITS_KEY = "kg_prefs_weight_units";

export function AppPreferences() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState<"kg" | "lbs">("kg");

  useEffect(() => {
    setMounted(true);
    try {
      const u = localStorage.getItem(UNITS_KEY);
      if (u === "lbs" || u === "kg") setUnits(u);
    } catch {
      /* ignore */
    }
  }, []);

  function saveUnits(next: "kg" | "lbs") {
    setUnits(next);
    try {
      localStorage.setItem(UNITS_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-kg-neutral-800/80">
      <h2 className="text-sm font-semibold text-kg-secondary">App preferences</h2>
      <div className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-kg-neutral-800 dark:text-white">
          Theme
          <select
            className="mt-1 w-full min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-kg-neutral-900"
            value={mounted ? theme : "system"}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <div>
          <p className="text-sm font-medium text-kg-neutral-800 dark:text-white">Weight units</p>
          <p className="text-xs text-kg-neutral-800/55 dark:text-white/55">
            Preference is saved on this device. Tracker entry still uses kg today — conversion UI can follow.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => saveUnits("kg")}
              className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${
                units === "kg"
                  ? "border-kg-primary bg-kg-primary/10 text-kg-secondary"
                  : "border-black/10 dark:border-white/15"
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => saveUnits("lbs")}
              className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${
                units === "lbs"
                  ? "border-kg-primary bg-kg-primary/10 text-kg-secondary"
                  : "border-black/10 dark:border-white/15"
              }`}
            >
              lbs
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-black/15 px-3 py-2 text-xs text-kg-neutral-800/60 dark:border-white/20 dark:text-white/55">
          Push notifications: coming soon (no cloud messaging wired yet).
        </div>
      </div>
    </div>
  );
}
