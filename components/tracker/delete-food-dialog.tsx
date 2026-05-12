"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FoodLog } from "@/types/database";

type Props = {
  log: FoodLog | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteFoodDialog({ log, onClose, onConfirm }: Props) {
  const open = Boolean(log);

  return (
    <AnimatePresence>
      {open && log ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="absolute inset-0 bg-black/50 dark:bg-black/70" aria-label="Close" onClick={onClose} />
          <motion.div
            role="alertdialog"
            aria-modal
            aria-labelledby="del-title"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-kg-border bg-kg-elevated p-6 text-kg-foreground shadow-xl"
          >
            <h2 id="del-title" className="text-lg font-bold">
              Delete this food?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-kg-muted">
              <span className="font-semibold text-kg-secondary">{log.food_name}</span> — {log.calories} kcal will be
              removed from your log.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 flex-1 rounded-xl border border-kg-border py-2.5 text-sm font-semibold text-kg-foreground hover:bg-kg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirm().then(onClose)}
                className="min-h-11 flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
