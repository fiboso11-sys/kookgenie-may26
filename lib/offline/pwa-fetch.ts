import { enqueueMutation } from "@/lib/offline/sync-queue";

function isMutation(method: string) {
  return method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE";
}

/** Offline / network-failed mutations return HTTP 202 with `{ queued: true }` (no server body). */
export function isOfflineQueuedMutateResponse(res: Response, body: { queued?: boolean }): boolean {
  return res.status === 202 && body.queued === true;
}

/**
 * Fetch for authenticated API routes. Queues mutating requests when offline or on network error.
 * Returns Response with status 202 and `{ "queued": true }` when queued.
 */
export async function pwaMutateFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  if (!isMutation(method)) {
    return fetch(input, init);
  }

  const url = input.startsWith("http") ? input : `${typeof window !== "undefined" ? window.location.origin : ""}${input}`;
  const body = typeof init.body === "string" ? init.body : init.body != null ? String(init.body) : null;

  const tryLive = async () => {
    const res = await fetch(input, { ...init, credentials: init.credentials ?? "include" });
    return res;
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    enqueueMutation({ url, method, body });
    return new Response(JSON.stringify({ queued: true }), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await tryLive();
    return res;
  } catch {
    enqueueMutation({ url, method, body });
    return new Response(JSON.stringify({ queued: true }), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    });
  }
}
