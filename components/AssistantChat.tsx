"use client";

import { FormEvent, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = [
  "How to cook rice",
  "How to cut vegetables",
  "Suggest healthy dinner",
  "Create workout plan",
  "Generate weekly meal plan",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm **KookGenie**. Ask me about cooking techniques, healthy meals, workouts, or meal planning. Replies use the OpenAI API when **OPENAI_API_KEY** is set in `.env.local`.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const nextMessages: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStatusNote(null);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        const err =
          typeof data.error === "string" ? data.error : `Request failed (${res.status}).`;
        setStatusNote(err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Could not reach the AI: ${err}` },
        ]);
        return;
      }
      const reply = typeof data.reply === "string" ? data.reply : "Sorry, something went wrong.";
      setStatusNote(null);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setStatusNote("Network error — check your connection and try again.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {statusNote && (
        <p className="rounded-xl border border-kg-accent/30 bg-orange-50 px-4 py-2 text-center text-xs font-medium text-kg-neutral-800">
          {statusNote}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-kg-neutral-800 shadow-sm hover:border-kg-primary/40"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex min-h-[420px] flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-kg-primary text-white"
                    : "bg-kg-neutral-100 text-kg-neutral-800"
                }`}
              >
                {m.content.split("**").map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j}>{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  ),
                )}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-center text-xs text-kg-neutral-800/60">KookGenie is thinking…</p>
          )}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-black/5 pt-3">
          <input
            className="flex-1 rounded-xl border border-black/10 bg-kg-neutral-100 px-3 py-2 text-sm outline-none focus:border-kg-primary"
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-kg-secondary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
