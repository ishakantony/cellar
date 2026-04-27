import { cn } from '../lib/cn';

export interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className }: DividerProps) {
  if (!text) {
    return <div className={cn('h-px bg-outline-variant/30', className)} />;
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-px flex-1 bg-outline-variant/30" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{text}</span>
      <div className="h-px flex-1 bg-outline-variant/30" />
    </div>
  );
}
