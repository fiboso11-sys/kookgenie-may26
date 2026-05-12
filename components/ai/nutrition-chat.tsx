"use client";

import { useCallback, useRef, useState } from "react";
import { AiLoadingState } from "@/components/ai/ai-loading-state";
import { AiSuggestions } from "@/components/ai/ai-suggestions";
import { toast } from "@/lib/toast";

type Role = "user" | "assistant";

type Msg = { role: Role; content: string };

export function NutritionChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I can explain macros, suggest balanced meals, and share general nutrition tips. I’m not a doctor and won’t diagnose conditions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const nextUser: Msg = { role: "user", content: trimmed };
      const prev = messages;
      const history = [...prev, nextUser];
      setMessages(history);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const json = (await res.json()) as {
          error?: string;
          reply?: string;
          bullets?: string[];
        };
        if (!res.ok) throw new Error(json.error ?? res.statusText);
        const parts = [json.reply ?? ""];
        if (json.bullets?.length) {
          parts.push("\n• " + json.bullets.join("\n• "));
        }
        setMessages((m) => [...m, { role: "assistant", content: parts.join("\n").trim() }]);
        setTimeout(scrollEnd, 80);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Chat failed");
        setMessages(prev);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, scrollEnd], // messages: snapshot for history + rollback
  );

  return (
    <div className="flex max-h-[min(55dvh,420px)] flex-col gap-3">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-black/8 bg-kg-neutral-100/50 p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-6 bg-kg-primary text-white"
                : "mr-4 border border-black/5 bg-white text-kg-neutral-800"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading ? <AiLoadingState label="Assistant is typing…" /> : null}
        <div ref={endRef} />
      </div>

      <AiSuggestions
        disabled={loading}
        onPick={(t) => {
          setInput(t);
          void send(t);
        }}
      />

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about nutrition…"
          maxLength={2000}
          className="min-h-11 flex-1 rounded-xl border border-black/10 px-3 text-sm"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        <button
          type="button"
          disabled={loading || !input.trim()}
          onClick={() => void send(input)}
          className="shrink-0 rounded-xl bg-kg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
