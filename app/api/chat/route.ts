import { NextResponse } from "next/server";
import {
  kookGenieOpenAIReply,
  type KookGenieChatTurn,
} from "@/lib/kookgenie-openai-chat";

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: string; content: string }[];
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const cleaned: KookGenieChatTurn[] = [];
    for (const m of messages) {
      if (
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
      ) {
        cleaned.push({ role: m.role, content: m.content.trim() });
      }
    }

    if (!cleaned.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const result = await kookGenieOpenAIReply(cleaned);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ reply: result.reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
