import { NextResponse } from "next/server";
import {
  kookGenieOpenAIReply,
  type KookGenieChatTurn,
} from "@/lib/kookgenie-openai-chat";

function parseChatBody(body: unknown): KookGenieChatTurn[] | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;

  if (typeof o.message === "string" && o.message.trim()) {
    return [{ role: "user", content: o.message.trim() }];
  }
  if (typeof o.input === "string" && o.input.trim()) {
    return [{ role: "user", content: o.input.trim() }];
  }

  if (!Array.isArray(o.messages)) return null;

  const out: KookGenieChatTurn[] = [];
  for (const m of o.messages) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: unknown }).content;
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.trim()
    ) {
      out.push({ role, content: content.trim() });
    }
  }
  return out.length ? out : null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = parseChatBody(body);
  if (!messages?.length) {
    return NextResponse.json(
      {
        error:
          "Send JSON with `message` (string) or `messages` (array of { role: user|assistant, content }).",
      },
      { status: 400 },
    );
  }

  const result = await kookGenieOpenAIReply(messages);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ reply: result.reply });
}
