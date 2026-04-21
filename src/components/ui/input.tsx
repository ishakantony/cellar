'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  onBlur?: (e?: React.FocusEvent<HTMLInputElement>) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled = false,
    error,
    className,
    id,
    name,
    autoFocus,
    onBlur,
  },
  ref
) {
  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      className={cn(
        'w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50 transition-all',
        disabled && 'cursor-not-allowed opacity-60',
        error && 'ring-1 ring-error',
        className
      )}
    />
  );
});
