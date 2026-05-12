import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
};

export function Logo({ className, href = "/", size = "md" }: Props) {
  const sizes = {
    sm: "text-lg gap-2",
    md: "text-xl gap-2.5",
    lg: "text-2xl gap-3",
  };
  const inner = (
    <span className={cn("inline-flex items-center font-semibold tracking-tight", sizes[size], className)}>
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-kg-primary to-kg-secondary text-lg text-white shadow-sm"
        aria-hidden
      >
        🧞‍♂️
      </span>
      <span className="font-[family-name:var(--font-heading)] text-kg-neutral-800">
        Kook<span className="text-kg-primary">Genie</span>
      </span>
    </span>
  );
  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-kg-primary rounded-lg">
        {inner}
      </Link>
    );
  }
  return inner;
}
