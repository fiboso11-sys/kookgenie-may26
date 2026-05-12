import Link from "next/link";

const show = process.env.NEXT_PUBLIC_SHOW_AUTH_BYPASS_UI === "true" || process.env.NEXT_PUBLIC_SHOW_AUTH_BYPASS_UI === "1";

export default function LoginBypassPage() {
  if (!show) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-sm text-kg-neutral-800/80">This page is not enabled.</p>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="font-medium text-kg-primary hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
      <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-kg-neutral-800">
        Bypass sign-in
      </h1>
      <p className="mt-2 text-sm text-kg-neutral-800/70">
        For when magic links are blocked. Requires <code className="rounded bg-black/5 px-1">KG_AUTH_BYPASS_ENABLED</code> and a
        matching server token. Turn off when you no longer need it.
      </p>

      <form action="/api/auth/bypass" method="post" className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-kg-neutral-800">
            Email (must exist or will be created)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none ring-kg-primary/30 focus:ring-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-kg-neutral-800">
            Bypass token
          </label>
          <input
            id="token"
            name="token"
            type="password"
            required
            autoComplete="off"
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none ring-kg-primary/30 focus:ring-2"
            placeholder="Value of KG_AUTH_BYPASS_TOKEN"
          />
        </div>
        <div>
          <label htmlFor="next" className="block text-sm font-medium text-kg-neutral-800">
            After sign-in (path)
          </label>
          <input
            id="next"
            name="next"
            type="text"
            defaultValue="/home"
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none ring-kg-primary/30 focus:ring-2"
            placeholder="/home"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-kg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-kg-secondary"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-kg-neutral-800/60">
        <Link href="/login" className="font-medium text-kg-primary hover:underline">
          ← Magic link sign in
        </Link>
      </p>
    </div>
  );
}
