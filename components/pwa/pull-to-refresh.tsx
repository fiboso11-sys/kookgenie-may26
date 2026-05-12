"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type TouchEvent } from "react";

/**
 * Light pull-to-refresh for mobile: when scrolled to top, pull down triggers router.refresh().
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const el = mainRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0]?.clientY ?? null;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (startY.current == null) return;
    const el = mainRef.current;
    if (!el || el.scrollTop > 0) return;
    const y = e.touches[0]?.clientY ?? 0;
    const delta = Math.max(0, y - startY.current);
    setPull(Math.min(delta, 80));
  }, []);

  const onTouchEnd = useCallback(() => {
    if (pull > 48) {
      router.refresh();
    }
    startY.current = null;
    setPull(0);
  }, [pull, router]);

  return (
    <div
      role="main"
      ref={mainRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] lg:overflow-visible"
    >
      {pull > 12 ? (
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-kg-primary/15 px-3 py-1 text-[10px] font-bold text-kg-secondary lg:hidden"
          style={{ transform: `translate(-50%, ${Math.min(pull, 40)}px)` }}
        >
          Release to refresh
        </div>
      ) : null}
      {children}
    </div>
  );
}
