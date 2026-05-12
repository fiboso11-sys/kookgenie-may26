import { getOpenAI } from "@/services/openai-server";

export const KOOKGENIE_SYSTEM_PROMPT =
  "You are KookGenie, a friendly AI cooking, health, and fitness assistant. Give concise, practical answers. Use short paragraphs or bullet steps when helpful.";

export type KookGenieChatTurn = { role: "user" | "assistant"; content: string };

export type KookGenieChatResult =
  | { ok: true; reply: string }
  | { ok: false; error: string; status: number };

export async function kookGenieOpenAIReply(
  messages: KookGenieChatTurn[],
): Promise<KookGenieChatResult> {
  const openai = getOpenAI();
  if (!openai) {
    return {
      ok: false,
      error: "OPENAI_API_KEY is not set. Add it to .env.local to enable the assistant.",
      status: 503,
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: KOOKGENIE_SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      return { ok: false, error: "Empty response from model.", status: 502 };
    }
    return { ok: true, reply };
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "OpenAI request failed";
    return { ok: false, error: message, status: 502 };
  }
}
