"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, type ToastPayload } from "@/lib/toast";

type Item = ToastPayload & { id: string };

export function ToastProvider() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    return subscribeToasts((p) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { ...p, id }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, 4200);
    });
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-0 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
      aria-live="polite"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl border border-black/10 px-4 py-3 text-sm font-medium shadow-lg ${
            t.type === "error" ? "bg-red-600 text-white" : "bg-kg-secondary text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
