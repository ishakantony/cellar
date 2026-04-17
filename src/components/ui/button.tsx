'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const allButtonVariants = ['primary', 'secondary', 'danger', 'ghost', 'outline'] as const;
export const allButtonSizes = ['sm', 'md', 'lg'] as const;

export type ButtonVariant = (typeof allButtonVariants)[number];
export type ButtonSize = (typeof allButtonSizes)[number];

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-primary-container/30 border border-primary/30 text-primary hover:bg-primary-container/50 hover:border-primary/50',
  secondary:
    'bg-surface-container border border-white/10 ghost-border text-on-surface-variant hover:bg-surface-bright hover:text-slate-100',
  danger: 'bg-error/20 border border-error/30 text-error hover:bg-error/30 hover:border-error/50',
  ghost: 'bg-transparent text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright',
  outline:
    'bg-transparent border border-white/10 text-on-surface-variant hover:border-white/20 hover:text-slate-100',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-xs',
  lg: 'px-4 py-2.5 text-xs',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
