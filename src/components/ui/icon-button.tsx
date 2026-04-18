'use client';

import { cn } from '@/lib/utils';

export interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

const variantClasses: Record<string, string> = {
  default: 'text-outline hover:text-slate-100 hover:bg-surface-bright',
  danger: 'text-outline hover:text-error hover:bg-error/10',
  ghost: 'text-outline hover:text-slate-100',
};

const sizeClasses: Record<string, string> = {
  sm: 'p-1',
  md: 'p-1.5',
};

const iconSizes: Record<string, string> = {
  sm: 'h-4 w-4',
  md: 'h-[18px] w-[18px]',
};

export function IconButton({
  icon: Icon,
  variant = 'default',
  size = 'md',
  onClick,
  className,
  label,
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={cn(
        'rounded cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
