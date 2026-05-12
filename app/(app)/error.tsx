"use client";

import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-red-100 bg-red-50/80 px-6 py-8 text-center dark:border-red-900/40 dark:bg-red-950/40">
      <h1 className="text-lg font-bold text-red-900 dark:text-red-100">This view crashed</h1>
      <p className="text-sm text-red-800/85 dark:text-red-100/80">{error.message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-xl bg-kg-primary px-4 text-sm font-semibold text-white"
        >
          Retry
        </button>
        <Link href="/home" className="min-h-11 inline-flex items-center rounded-xl border border-black/15 px-4 text-sm font-semibold">
          Home
        </Link>
      </div>
    </div>
  );
}
