import { cn } from '../lib/cn';
import { Button } from './button';

export interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('py-16 text-center', className)}>
      <p className="text-xs text-outline">{message}</p>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}
