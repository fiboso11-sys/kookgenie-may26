/**
 * User-facing copy for any Gemini upstream failure (invalid key, quota, model, timeout, etc.).
 * Never surface raw Google SDK strings to clients.
 */
export const GEMINI_UNAVAILABLE_USER_MESSAGE =
  "AI nutrition estimation is temporarily unavailable. You can still use library matches, search, or log foods manually.";

export class GeminiIntegrationFailure extends Error {
  constructor(
    message: string,
    /** Server log context (not sent to the client). */
    public readonly logContext: string,
    public readonly causeDetail?: unknown,
  ) {
    super(message);
    this.name = "GeminiIntegrationFailure";
  }
}

export function isGeminiIntegrationFailure(e: unknown): e is GeminiIntegrationFailure {
  return e instanceof GeminiIntegrationFailure;
}

export function logGeminiServerDetail(context: string, err: unknown): void {
  const detail =
    err instanceof Error
      ? `${err.name}: ${err.message}${err.stack ? `\n${err.stack}` : ""}`
      : String(err);
  console.error(`[kg/gemini] ${context}`, detail);
}
