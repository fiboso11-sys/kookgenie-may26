import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  className?: string;
};

export function VideoPlaceholder({ title = "Video lesson", className }: Props) {
  return (
    <div
      className={cn(
        "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-kg-neutral-100 to-white shadow-inner",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(22,163,74,0.12),transparent_50%)]" />
      <div className="relative flex flex-col items-center gap-2 text-center text-kg-neutral-800/70">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md text-2xl">▶</span>
        <p className="text-sm font-medium text-kg-neutral-800">{title}</p>
        <p className="text-xs text-kg-neutral-800/60">Placeholder — embed your video host here</p>
      </div>
    </div>
  );
}
