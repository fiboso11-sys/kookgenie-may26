"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DISMISS_KEY = "kg_pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[58] mx-auto flex max-w-lg flex-wrap items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur-md lg:bottom-6 lg:max-w-md">
      <p className="text-kg-neutral-800">
        <span className="font-semibold text-kg-secondary">Install KookGenie</span> — add to Home Screen for a full-screen app.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-xl bg-kg-primary px-3 py-1.5 text-xs font-bold text-white"
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setVisible(false);
            setDeferred(null);
          }}
        >
          Install
        </button>
        <button
          type="button"
          className="rounded-xl border border-black/15 px-3 py-1.5 text-xs font-semibold text-kg-neutral-800"
          onClick={() => {
            try {
              localStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
            setVisible(false);
            setDeferred(null);
          }}
        >
          Not now
        </button>
      </div>
      <p className="w-full text-[10px] text-kg-neutral-800/55">
        iPhone: Safari → Share → <strong>Add to Home Screen</strong>.{" "}
        <Link href="/settings" className="text-kg-primary underline">
          Settings
        </Link>
      </p>
    </div>
  );
}
