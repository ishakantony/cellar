import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  rows?: number;
  onBlur?: (e?: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    value,
    onChange,
    placeholder,
    disabled = false,
    error,
    className,
    id,
    name,
    autoFocus,
    rows = 4,
    onBlur,
  },
  ref
) {
  return (
    <textarea
      ref={ref}
      id={id}
      name={name}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      rows={rows}
      className={cn(
        'w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y',
        disabled && 'cursor-not-allowed opacity-60',
        error && 'ring-1 ring-error',
        className
      )}
    />
  );
});
