import { cn } from '../lib/cn';

export interface TypeBadgeProps {
  /** Display label, e.g. "snippet" or "PROMPT". Rendered as-is. */
  label: string;
  /** Hex (or any CSS color) for the badge tint. The badge bg is `${color}/10`. */
  color: string;
  className?: string;
}

/**
 * Small monospace tinted pill used to label an asset's type on cards/tables.
 * Bg is the color at ~10% alpha; text is the color at full opacity.
 */
export function TypeBadge({ label, color, className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono text-[10px] font-medium tracking-wider',
        'rounded-sm px-1.5 py-0.5',
        className
      )}
      style={{
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  );
}
