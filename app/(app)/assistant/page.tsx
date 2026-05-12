import { AssistantChat } from "@/components/AssistantChat";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          AI Assistant
        </h1>
        <p className="mt-2 text-kg-neutral-800/70">
          Powered by OpenAI when configured; otherwise keyword-aware demo replies.
        </p>
      </div>
      <AssistantChat />
    </div>
  );
}
