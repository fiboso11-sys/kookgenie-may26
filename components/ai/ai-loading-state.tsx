"use client";

import { motion } from "framer-motion";

export function AiLoadingState({ label = "Thinking…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-kg-neutral-800">
      <motion.span
        className="inline-flex h-2 w-2 rounded-full bg-kg-primary"
        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.1, repeat: Infinity }}
      />
      <span className="font-medium text-kg-secondary">{label}</span>
    </div>
  );
}
