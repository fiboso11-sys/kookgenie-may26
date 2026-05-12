"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, error, children, className }: Props) {
  return (
    <div className={cn("space-y-1 text-sm", className)}>
      <span className="block font-medium text-kg-foreground">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="block text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}
