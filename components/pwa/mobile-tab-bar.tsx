"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "Home", match: (p: string) => p === "/home" || p === "/" },
  { href: "/food-logs", label: "Food", match: (p: string) => p.startsWith("/food-logs") },
  { href: "/assistant", label: "AI", match: (p: string) => p.startsWith("/assistant") },
  { href: "/health", label: "Progress", match: (p: string) => p.startsWith("/health") || p.startsWith("/water") || p.startsWith("/weight") },
  { href: "/profile", label: "Profile", match: (p: string) => p.startsWith("/profile") || p.startsWith("/settings") },
] as const;

export function MobileTabBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-kg-border bg-kg-elevated/95 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-lg lg:hidden"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg justify-between px-1">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                prefetch
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition active:scale-[0.97]",
                  active ? "text-kg-primary" : "text-kg-muted",
                )}
              >
                <span
                  className={cn(
                    "h-1 w-8 rounded-full transition",
                    active ? "bg-kg-primary" : "bg-transparent",
                  )}
                  aria-hidden
                />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
