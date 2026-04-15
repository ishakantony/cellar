"use client";

import { cn } from "@/lib/utils";

export interface InputProps {
  type?: "text" | "email" | "password" | "url";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className,
  id,
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50 transition-all",
        disabled && "cursor-not-allowed opacity-60",
        error && "ring-1 ring-error",
        className
      )}
    />
  );
}
