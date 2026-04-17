'use client';

import { cn } from '@/lib/utils';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ orientation = 'horizontal', className }: SeparatorProps) {
  return (
    <div
      className={cn(
        'bg-outline-variant/30',
        orientation === 'horizontal' ? 'h-px flex-1' : 'w-px h-full',
        className
      )}
    />
  );
}
