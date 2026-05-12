"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { MobileTabBar } from "@/components/pwa/mobile-tab-bar";
import { PullToRefresh } from "@/components/pwa/pull-to-refresh";

const nav = [
  { href: "/home", label: "Home" },
  { href: "/food-logs", label: "Calories" },
  { href: "/health", label: "Health" },
  { href: "/water", label: "Water" },
  { href: "/weight", label: "Weight" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/academy", label: "Cooking Academy" },
  { href: "/recipes", label: "Recipes" },
  { href: "/generator", label: "AI Recipe Generator" },
  { href: "/meal-planner", label: "Meal Planner" },
  { href: "/workouts", label: "Workouts" },
  { href: "/fasting", label: "Fasting Tracker" },
  { href: "/grocery", label: "Grocery List" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-kg-surface">
      <header className="sticky top-0 z-40 border-b border-kg-border bg-kg-elevated/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo href="/home" size="sm" />
          <button
            type="button"
            className="rounded-lg border border-kg-border px-3 py-2 text-sm font-medium text-kg-foreground hover:bg-kg-surface"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
        {open && (
          <nav className="border-t border-kg-border bg-kg-elevated px-4 py-3 shadow-inner">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium",
                      pathname === item.href
                        ? "bg-kg-primary/15 text-kg-secondary"
                        : "text-kg-foreground hover:bg-kg-surface",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col lg:min-h-0 lg:flex-row">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-black/5 bg-white lg:block">
          <div className="flex h-full flex-col gap-6 px-4 py-8">
            <Logo href="/home" size="sm" />
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition",
                    pathname === item.href
                      ? "bg-kg-primary text-white shadow-sm"
                      : "text-kg-neutral-800 hover:bg-kg-neutral-100",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/"
              className="text-center text-xs font-medium text-kg-muted hover:text-kg-primary"
            >
              ← Back to landing
            </Link>
          </div>
        </aside>

        <PullToRefresh>
          <div className="min-h-screen flex-1 px-4 py-8 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:min-h-screen lg:pb-8 lg:pt-8 lg:px-10">
            {children}
          </div>
        </PullToRefresh>
      </div>
      <MobileTabBar />
    </div>
  );
}
