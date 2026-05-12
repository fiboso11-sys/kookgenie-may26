"use client";

import Link from "next/link";

export function OfflineScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="rounded-3xl border border-kg-border bg-kg-elevated/95 px-8 py-10 text-kg-foreground shadow-lg backdrop-blur-md">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">You&apos;re offline</h1>
        <p className="mt-2 text-sm leading-relaxed text-kg-muted">
          Check your connection. Saved meals and logs on this device stay available when you open tracker pages you&apos;ve used online before.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-kg-primary px-5 text-sm font-semibold text-white"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
