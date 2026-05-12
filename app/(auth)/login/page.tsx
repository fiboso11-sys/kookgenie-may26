"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setStatus("error");
      setMessage(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).",
      );
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/profile`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("sent");
      setMessage("Check your email for the magic link.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-kg-neutral-800">
        Sign in to KookGenie
      </h1>
      <p className="mt-2 text-sm text-kg-neutral-800/70">
        We&apos;ll email you a magic link — no password to remember.
      </p>

      {!configured && (
        <p className="mt-4 rounded-xl bg-kg-accent/10 px-4 py-3 text-sm text-kg-neutral-800">
          Set Supabase environment variables to enable authentication.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-kg-neutral-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none ring-kg-primary/30 focus:ring-2"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-kg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-kg-secondary disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-kg-secondary"}`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-kg-neutral-800/60">
        <Link href="/home" className="font-medium text-kg-primary hover:underline">
          ← Back to app
        </Link>
      </p>
    </div>
  );
}
