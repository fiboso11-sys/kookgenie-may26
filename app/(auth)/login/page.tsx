"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "done"
  >("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setStatus("loading");

    // simulate small delay for UX
    setTimeout(() => {
      setStatus("done");
    }, 500);
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-black">
        Welcome to KookGenie
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        No login required — continue as guest.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white"
        >
          {status === "loading"
            ? "Loading..."
            : "Continue to App"}
        </button>
      </form>

      {status === "done" && (
        <p className="mt-4 text-sm text-green-600">
          Guest mode activated ✓
        </p>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/" className="underline">
          ← Go to home
        </Link>
      </p>
    </div>
  );
}