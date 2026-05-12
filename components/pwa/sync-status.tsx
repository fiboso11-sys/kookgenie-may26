"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSyncQueue, getQueueLength } from "@/lib/offline/sync-queue";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function SyncStatus() {
  const [pending, setPending] = useState(0);
  const [flushing, setFlushing] = useState(false);

  const refresh = useCallback(() => setPending(getQueueLength()), []);

  useEffect(() => {
    refresh();
    const onQueue = () => refresh();
    window.addEventListener("kg-sync-queue", onQueue);
    return () => window.removeEventListener("kg-sync-queue", onQueue);
  }, [refresh]);

  useEffect(() => {
    const onOnline = async () => {
      if (getQueueLength() === 0) return;
      setFlushing(true);
      try {
        const { ok, pending: left } = await flushSyncQueue();
        if (ok > 0) toast.success(`Synced ${ok} queued action(s)`);
        if (left > 0) toast.error(`${left} action(s) still pending — try again`);
        window.dispatchEvent(new Event("kg-pwa-synced"));
      } finally {
        setFlushing(false);
        refresh();
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [refresh]);

  if (pending === 0 && !flushing) return null;

  return (
    <button
      type="button"
      disabled={flushing}
      onClick={async () => {
        setFlushing(true);
        try {
          await flushSyncQueue();
          refresh();
          toast.success("Sync attempted");
          window.dispatchEvent(new Event("kg-pwa-synced"));
        } finally {
          setFlushing(false);
        }
      }}
      className={cn(
        "fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-3 z-[55] max-w-[min(220px,calc(100vw-6rem))] rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-left text-[11px] font-semibold text-amber-950 shadow-sm backdrop-blur-sm lg:hidden",
      )}
    >
      {flushing ? "Syncing…" : `${pending} queued — tap to retry`}
    </button>
  );
}
