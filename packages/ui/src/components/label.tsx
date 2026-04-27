import { cn } from '../lib/cn';

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({ children, htmlFor, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant',
        className
      )}
    >
      {children}
    </label>
  );
}
