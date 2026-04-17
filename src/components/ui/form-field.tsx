"use client";

import { useId, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  const id = useId();
  
  return (
    <div className={cn("space-y-1.5", className)}>
      <label 
        htmlFor={id}
        className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
      >
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(children, { id } as Record<string, unknown>)
        : children}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
}
