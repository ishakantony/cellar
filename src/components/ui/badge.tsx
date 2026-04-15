"use client";

import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "default" | "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-surface-container text-outline",
  primary: "bg-primary/10 text-primary",
  secondary: "text-outline bg-surface-container",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
