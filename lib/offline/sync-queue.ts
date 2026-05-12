/**
 * Local mutation queue for offline / flaky network. Flushed on `online` via `flushSyncQueue`.
 */

const STORAGE_KEY = "kg_pwa_sync_queue_v1";

export type QueuedMutation = {
  id: string;
  url: string;
  method: string;
  body: string | null;
  createdAt: number;
};

function readQueue(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedMutation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedMutation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
}

export function getQueueLength(): number {
  return readQueue().length;
}

export function enqueueMutation(input: { url: string; method: string; body: string | null }): string {
  const id = crypto.randomUUID();
  const q = readQueue();
  q.push({ id, url: input.url, method: input.method, body: input.body, createdAt: Date.now() });
  writeQueue(q);
  window.dispatchEvent(new CustomEvent("kg-sync-queue"));
  return id;
}

export function removeMutation(id: string) {
  const q = readQueue().filter((x) => x.id !== id);
  writeQueue(q);
  window.dispatchEvent(new CustomEvent("kg-sync-queue"));
}

export async function flushSyncQueue(): Promise<{ ok: number; pending: number }> {
  const q = readQueue();
  let ok = 0;
  const remaining: QueuedMutation[] = [];

  for (const item of q) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        credentials: "include",
        headers:
          item.body != null
            ? { "Content-Type": "application/json" }
            : undefined,
        body: item.body ?? undefined,
      });
      if (res.ok || res.status === 204) ok++;
      else remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
  window.dispatchEvent(new CustomEvent("kg-sync-queue"));
  return { ok, pending: remaining.length };
}
