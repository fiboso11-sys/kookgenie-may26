import { FastingTracker } from "@/components/FastingTracker";

export default function FastingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          Fasting Tracker
        </h1>
        <p className="mt-2 text-kg-neutral-800/70">
          Choose 16:8, 18:6, or OMAD—run a live timer and keep a lightweight local history.
        </p>
      </div>
      <FastingTracker />
    </div>
  );
}
