import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { isSupabaseEnvConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const configured = isSupabaseEnvConfigured();
  const openai = Boolean(process.env.OPENAI_API_KEY);
  const gemini = Boolean(process.env.GEMINI_API_KEY?.trim());

  let userEmail: string | null = null;
  let userId: string | null = null;

  if (configured) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.auth.getUser();
      userEmail = data.user?.email ?? null;
      userId = data.user?.id ?? null;
    } catch {
      userEmail = null;
      userId = null;
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">Profile</h1>
        <p className="mt-2 text-kg-neutral-800/70">
          Account and integrations. Track in{" "}
          <Link href="/food-logs" className="font-medium text-kg-primary hover:underline">
            Calories
          </Link>
          ,{" "}
          <Link href="/health" className="font-medium text-kg-primary hover:underline">
            Health
          </Link>
          ,{" "}
          <Link href="/water" className="font-medium text-kg-primary hover:underline">
            Water
          </Link>
          ,{" "}
          <Link href="/weight" className="font-medium text-kg-primary hover:underline">
            Weight
          </Link>
          .
        </p>
        <p className="mt-3">
          <Link
            href="/settings"
            className="inline-flex min-h-11 items-center rounded-xl bg-kg-primary/10 px-4 text-sm font-semibold text-kg-secondary hover:bg-kg-primary/15"
          >
            App settings & export
          </Link>
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="border-b border-black/5 bg-kg-neutral-100 px-6 py-4">
          <p className="text-sm font-semibold text-kg-secondary">Session</p>
          {userId && userEmail ? (
            <>
              <p className="text-lg font-semibold text-kg-neutral-800">Signed in</p>
              <p className="text-sm text-kg-neutral-800/65">{userEmail}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-kg-neutral-800">Not signed in</p>
              <p className="text-sm text-kg-neutral-800/65">
                {configured ? "Use magic link to access your data." : "Configure Supabase to enable auth."}
              </p>
            </>
          )}
        </div>
        <div className="space-y-4 px-6 py-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-kg-neutral-100 px-4 py-3">
            <span className="text-kg-neutral-800/80">Supabase</span>
            <span className={configured ? "font-semibold text-kg-primary" : "font-semibold text-kg-accent"}>
              {configured ? "Configured" : "Not configured"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-kg-neutral-100 px-4 py-3">
            <span className="text-kg-neutral-800/80">OpenAI API</span>
            <span className="font-semibold text-kg-neutral-800">
              {openai ? "Server key present" : "Demo / mock mode"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-kg-neutral-100 px-4 py-3">
            <span className="text-kg-neutral-800/80">Gemini (nutrition AI)</span>
            <span className="font-semibold text-kg-neutral-800">
              {gemini ? "Server key present" : "Parse/chat/ideas need GEMINI_API_KEY"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {configured && !userId && (
              <Link
                href="/login"
                className="inline-flex rounded-xl bg-kg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-kg-secondary"
              >
                Log in
              </Link>
            )}
            {userId && <SignOutButton />}
          </div>

          <p className="text-xs text-kg-neutral-800/55">
            See <code className="rounded bg-black/5 px-1">docs/SUPABASE_SETUP.md</code> for URL configuration and SQL
            migration.             <code className="rounded bg-black/5 px-1">OPENAI_API_KEY</code> and{" "}
            <code className="rounded bg-black/5 px-1">GEMINI_API_KEY</code> are server-only; use{" "}
            <code className="rounded bg-black/5 px-1">.env.local</code> locally.
          </p>
        </div>
      </div>
    </div>
  );
}
