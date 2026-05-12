/**
 * Minimal toast bus (no external deps). Works even when Turbopack hoists the wrong workspace root.
 */
export type ToastPayload = { message: string; type: "success" | "error" };

const listeners = new Set<(p: ToastPayload) => void>();

function emit(p: ToastPayload) {
  listeners.forEach((fn) => {
    try {
      fn(p);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeToasts(fn: (p: ToastPayload) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const toast = {
  success: (message: string) => emit({ message, type: "success" }),
  error: (message: string) => emit({ message, type: "error" }),
};
