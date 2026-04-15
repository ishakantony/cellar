"use client";

import { cn } from "@/lib/utils";

export interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger" | "ghost";
  size?: "sm" | "md";
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  label?: string;
}

const variantClasses: Record<string, string> = {
  default: "text-outline hover:text-slate-100 hover:bg-surface-bright",
  danger: "text-outline hover:text-error hover:bg-error/10",
  ghost: "text-outline hover:text-slate-100",
};

const sizeClasses: Record<string, string> = {
  sm: "p-1",
  md: "p-1.5",
};

const iconSizes: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-[18px] w-[18px]",
};

export function IconButton({
  icon: Icon,
  variant = "default",
  size = "md",
  onClick,
  className,
  label,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded transition-all",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
