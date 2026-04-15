"use client";

import { cn } from "@/lib/utils";

export interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingClasses: Record<string, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  hoverable = false,
  onClick,
  className,
  padding = "md",
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface-container ghost-border rounded-xl transition-all",
        paddingClasses[padding],
        hoverable &&
          "hover:bg-surface-bright hover:border-white/20 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
