"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export function ProfileSettings() {
  const { user } = useSupabaseAuth();

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-kg-neutral-800/80">
      <h2 className="text-sm font-semibold text-kg-secondary">Account</h2>
      <p className="mt-2 text-sm text-kg-neutral-800 dark:text-white">
        {user?.email ? (
          <>
            Signed in as <span className="font-medium">{user.email}</span>
          </>
        ) : (
          "Not signed in"
        )}
      </p>
      <Link
        href="/profile"
        className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-black/10 px-4 text-sm font-semibold text-kg-primary dark:border-white/15"
      >
        Open profile
      </Link>
    </div>
  );
}
