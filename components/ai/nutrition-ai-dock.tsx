"use client";

import { useState } from "react";
import { KG_EMERGENCY_DISABLE_AI } from "@/lib/config/emergency-recovery";
import { AnimatePresence, motion } from "framer-motion";
import type { ParsedFoodItem } from "@/lib/ai/schemas";
import type { DailyGoals } from "@/hooks/use-tracker-goals";
import type { MacroTotals } from "@/lib/utils/nutrition";
import type { MealType } from "@/types/database";
import { AiErrorBoundary } from "@/components/ai/ai-error-boundary";
import { AiFoodParser } from "@/components/ai/ai-food-parser";
import { NutritionChat } from "@/components/ai/nutrition-chat";
import { SmartRecommendations } from "@/components/ai/smart-recommendations";

type Tab = "parse" | "chat" | "ideas";

type Props = {
  totals: MacroTotals;
  goals: DailyGoals | null;
  mealType: MealType;
  onApplyParsedFood: (item: ParsedFoodItem, meal: MealType) => void;
};

export function NutritionAiDock({ totals, goals, mealType, onApplyParsedFood }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("parse");

  if (KG_EMERGENCY_DISABLE_AI) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Open nutrition AI"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-kg-secondary text-xl font-bold text-white shadow-lg ring-2 ring-white/90 ring-offset-2 ring-offset-kg-surface transition hover:scale-[1.03] active:scale-95 dark:ring-white/20 dark:ring-offset-kg-surface lg:bottom-8 lg:right-8"
      >
        AI
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[1px] dark:bg-black/70"
              aria-label="Close nutrition AI"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal
              aria-label="Nutrition AI"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="relative z-10 mx-auto flex max-h-[min(88dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-black/10 bg-white shadow-2xl sm:max-h-[min(80dvh,620px)] sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-kg-neutral-800">Nutrition AI</p>
                  <p className="text-[11px] text-kg-neutral-800/55">
                    Assist only — log is source of truth. Quick adds use the{" "}
                    <span className="font-semibold capitalize">{mealType}</span> section (open that meal first to
                    change).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-3 py-1 text-sm font-medium text-kg-muted hover:bg-kg-surface"
                >
                  Close
                </button>
              </div>

              <div className="flex gap-1 border-b border-black/5 px-2 pt-1">
                {(
                  [
                    ["parse", "Parse"],
                    ["chat", "Chat"],
                    ["ideas", "Ideas"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex-1 rounded-t-lg py-2 text-xs font-semibold ${
                      tab === id ? "bg-kg-primary/15 text-kg-secondary" : "text-kg-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <AiErrorBoundary>
                  {tab === "parse" ? (
                    <AiFoodParser mealType={mealType} onApplyParsed={onApplyParsedFood} />
                  ) : null}
                  {tab === "chat" ? <NutritionChat /> : null}
                  {tab === "ideas" ? (
                    <SmartRecommendations
                      totals={totals}
                      goals={goals}
                      mealType={mealType}
                      onApplyMeal={onApplyParsedFood}
                    />
                  ) : null}
                </AiErrorBoundary>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
