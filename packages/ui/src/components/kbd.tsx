import { cn } from '../lib/cn';

export interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Inline monospace key indicator used in the command-palette trigger and
 * keyboard hints (e.g. ⌘K, esc, ↵).
 */
export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center rounded-sm border border-outline bg-surface-bright',
        'px-1.5 py-px font-mono text-[10px] text-on-surface-muted',
        className
      )}
    >
      {children}
    </kbd>
  );
}
