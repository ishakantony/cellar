"use client";

import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full bg-surface-bright object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-container font-bold text-on-primary-container",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
