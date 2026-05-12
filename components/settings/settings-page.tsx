"use client";

import { AppPreferences } from "@/components/settings/app-preferences";
import { ExportData } from "@/components/settings/export-data";
import { NutritionGoalsSettings } from "@/components/settings/nutrition-goals";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { WaterGoalSettings } from "@/components/settings/water-goal-settings";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-kg-neutral-800/65 dark:text-white/65">
          App preferences, goals, and data export. Tracking screens are unchanged.
        </p>
      </div>
      <ProfileSettings />
      <NutritionGoalsSettings />
      <WaterGoalSettings />
      <AppPreferences />
      <ExportData />
    </div>
  );
}
