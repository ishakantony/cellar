import { cn } from '../lib/cn';

export interface SectionHeaderProps {
  title: string;
  count?: number | null;
  /** Right-aligned action label. Renders as a small text-button when provided. */
  action?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Dashboard section heading with an optional count chip and right-aligned
 * action link. Used by the Vault dashboard's "Pinned", "Your vault",
 * "Recently accessed", "Collections" sections.
 */
export function SectionHeader({ title, count, action, onAction, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-foreground">{title}</span>
        {count != null && (
          <span className="rounded-full bg-surface-bright px-1.5 py-px font-mono text-[10px] text-on-surface-faint">
            {count}
          </span>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-sm px-1 py-0.5 text-[11px] text-primary opacity-80 hover:opacity-100 transition-opacity"
        >
          {action}
        </button>
      )}
    </div>
  );
}
