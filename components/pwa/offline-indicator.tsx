"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none fixed left-1/2 top-[max(0.5rem,env(safe-area-inset-top))] z-[70] -translate-x-1/2 rounded-full px-3 py-1 text-center text-[11px] font-semibold shadow-md transition-opacity duration-300 lg:hidden",
        online ? "opacity-0" : "bg-amber-600 text-white opacity-100",
      )}
    >
      Offline
    </div>
  );
}
