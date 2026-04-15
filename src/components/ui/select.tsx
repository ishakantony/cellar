"use client";

import { cn } from "@/lib/utils";

export interface SelectOption<T> {
  value: T;
  label: string;
}

export interface SelectProps<T> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  className,
}: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      disabled={disabled}
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded bg-surface-container border-none text-on-surface-variant focus:ring-1 focus:ring-primary/50",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
