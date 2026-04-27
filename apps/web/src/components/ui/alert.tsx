import { cn } from '@/lib/utils';

export interface AlertProps {
  variant: 'error' | 'success';
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  error: 'border-error/30 bg-error/10 text-error',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
};

export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div className={cn('rounded-lg border px-4 py-2 text-xs', variantClasses[variant], className)}>
      {children}
    </div>
  );
}
