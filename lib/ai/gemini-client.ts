import { GoogleGenerativeAI } from "@google/generative-ai";
import { KG_EMERGENCY_DISABLE_AI } from "@/lib/config/emergency-recovery";
import {
  GeminiIntegrationFailure,
  GEMINI_UNAVAILABLE_USER_MESSAGE,
  logGeminiServerDetail,
} from "@/lib/ai/gemini-errors";

/**
 * Default model for `@google/generative-ai` (override with GEMINI_MODEL).
 * `gemini-2.0-flash` is widely available on new keys; use `gemini-1.5-flash` via env if your project requires it.
 */
const DEFAULT_MODEL = "gemini-2.0-flash";
const TIMEOUT_MS = 28_000;
const MAX_RETRIES = 2;

function getGenAI(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export function isGeminiConfigured(): boolean {
  if (KG_EMERGENCY_DISABLE_AI) return false;
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function shouldAbortGeminiRetries(err: unknown): boolean {
  const parts: string[] = [];
  let cur: unknown = err;
  let depth = 0;
  while (cur != null && depth < 6) {
    if (cur instanceof Error) {
      parts.push(cur.message, String(cur.name));
    } else if (typeof cur === "object" && "message" in cur) {
      parts.push(String((cur as { message: unknown }).message));
    } else {
      parts.push(String(cur));
    }
    cur = cur instanceof Error ? cur.cause : undefined;
    depth += 1;
  }
  const blob = parts.join(" ");
  return /API_KEY_INVALID|API key not valid|not valid|PERMISSION_DENIED|401|403|\b429\b|Too Many Requests|UNAUTHENTICATED|billing|Quota exceeded|quota exceeded|RESOURCE_EXHAUSTED|RATE_LIMIT|API_KEY|invalid api key/i.test(
    blob,
  );
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Gemini request timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

export type GeminiJsonParams = {
  systemInstruction: string;
  userText: string;
  temperature?: number;
  maxOutputTokens?: number;
};

/**
 * Single-turn JSON generation. Retries only for likely-transient failures.
 * Auth / invalid key failures fail fast (no retry storm).
 */
export async function generateGeminiJson(params: GeminiJsonParams): Promise<string> {
  if (KG_EMERGENCY_DISABLE_AI) {
    logGeminiServerDetail("generateGeminiJson:emergency_disabled", new Error("KG_EMERGENCY_DISABLE_AI"));
    throw new GeminiIntegrationFailure(GEMINI_UNAVAILABLE_USER_MESSAGE, "generateGeminiJson:emergency_disabled");
  }
  const genAI = getGenAI();
  if (!genAI) {
    logGeminiServerDetail("generateGeminiJson:missing_key", new Error("GEMINI_API_KEY empty"));
    throw new GeminiIntegrationFailure(
      GEMINI_UNAVAILABLE_USER_MESSAGE,
      "generateGeminiJson:missing_key",
    );
  }

  const modelId = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: params.systemInstruction,
    generationConfig: {
      temperature: params.temperature ?? 0.25,
      maxOutputTokens: params.maxOutputTokens ?? 2048,
      responseMimeType: "application/json",
    },
  });

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(
        model.generateContent({
          contents: [{ role: "user", parts: [{ text: params.userText }] }],
        }),
        TIMEOUT_MS,
      );
      const text = result.response.text();
      if (!text?.trim()) throw new Error("Empty Gemini response");
      return text.trim();
    } catch (e) {
      lastErr = e;
      logGeminiServerDetail(`generateGeminiJson:attempt_${attempt + 1}`, e);
      if (shouldAbortGeminiRetries(e)) {
        throw new GeminiIntegrationFailure(
          GEMINI_UNAVAILABLE_USER_MESSAGE,
          `generateGeminiJson:non_retryable:${modelId}`,
          e,
        );
      }
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }

  throw new GeminiIntegrationFailure(
    GEMINI_UNAVAILABLE_USER_MESSAGE,
    `generateGeminiJson:exhausted_retries:${modelId}`,
    lastErr,
  );
}
