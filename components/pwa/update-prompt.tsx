"use client";

import { useEffect, useState } from "react";

export function UpdatePrompt() {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let cancelled = false;

    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg || cancelled) return;
      if (reg.waiting) setWaiting(true);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(true);
          }
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!waiting) return null;

  return (
    <div className="fixed bottom-[calc(7rem+env(safe-area-inset-bottom))] right-3 z-[60] max-w-[200px] rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-950 shadow-lg lg:bottom-6">
      <p className="mb-2">New version ready.</p>
      <button
        type="button"
        className="w-full rounded-lg bg-sky-600 py-1.5 text-white"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
}
