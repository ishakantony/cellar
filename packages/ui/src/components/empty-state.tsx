import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface EmptyStateProps {
  message: ReactNode;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn('py-16 text-center', className)}>
      <p className="text-xs text-outline">{message}</p>
    </div>
  );
}
