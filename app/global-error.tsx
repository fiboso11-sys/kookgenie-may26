"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-kg-neutral-100 px-6 text-kg-neutral-800">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-center text-sm opacity-80">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-11 rounded-xl bg-kg-primary px-5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
