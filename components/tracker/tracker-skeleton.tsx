import { cn } from "@/lib/utils";

export function TrackerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-6", className)}>
      <div className="h-10 w-48 rounded-lg bg-black/10 dark:bg-white/10" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-black/10 dark:bg-white/10" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="h-40 w-40 rounded-full bg-black/10 dark:bg-white/10" />
        <div className="h-40 flex-1 min-w-[200px] rounded-2xl bg-black/10 dark:bg-white/10" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-black/10 dark:bg-white/10" />
      ))}
    </div>
  );
}
