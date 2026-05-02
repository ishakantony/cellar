import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { cn, useClickOutside } from '@cellar/ui';
import type { FeatureRegistryEntry } from '@cellar/shell-contract';

const DEFAULT_ACCENT = 'var(--color-primary)';

export interface AppSwitcherProps {
  /** Registry entries that should appear in the popover. */
  entries: FeatureRegistryEntry[];
  /** Currently-active feature, used to render the pill label/icon/accent. */
  active?: FeatureRegistryEntry;
  /** Optional workspace label rendered as a sub-line under the feature name. */
  workspaceLabel?: string;
  className?: string;
}

/**
 * Top-of-sidebar pill that shows the currently-active feature and opens a
 * 3-tile popover for switching apps. Clicking a tile navigates to the
 * feature's `basePath`.
 */
export function AppSwitcher({
  entries,
  active,
  workspaceLabel = 'Personal',
  className,
}: AppSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useClickOutside(containerRef, () => setOpen(false), open);

  const accent = active?.manifest.accent ?? DEFAULT_ACCENT;
  const ActiveIcon = active?.manifest.icon;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={active ? `Switch app — current: ${active.manifest.label}` : 'Switch app'}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors"
        style={{
          background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
        }}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm"
          style={{ background: `color-mix(in srgb, ${accent} 15%, transparent)` }}
        >
          {ActiveIcon && <ActiveIcon className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-xs font-semibold leading-none"
            style={{ color: accent }}
          >
            {active?.manifest.label ?? 'Cellar'}
          </span>
          <span className="mt-0.5 block truncate text-[10px] text-on-surface-faint">
            {workspaceLabel}
          </span>
        </span>
        <ChevronDown className="h-2.5 w-2.5 shrink-0 text-on-surface-faint" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Switch app"
          className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-outline bg-surface-container-high p-2.5 shadow-popover"
        >
          <p className="mb-2 px-0.5 text-[10px] font-medium uppercase tracking-widest text-on-surface-faint">
            Switch app
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {entries.map(entry => {
              const Icon = entry.manifest.icon;
              const tileAccent = entry.manifest.accent ?? DEFAULT_ACCENT;
              const isActive = entry.manifest.id === active?.manifest.id;
              return (
                <button
                  key={entry.manifest.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    navigate(entry.manifest.basePath);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-md px-1 py-2 transition-colors',
                    'hover:bg-surface-container-highest'
                  )}
                  style={
                    isActive
                      ? { background: `color-mix(in srgb, ${tileAccent} 10%, transparent)` }
                      : undefined
                  }
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md"
                    style={{
                      background: `color-mix(in srgb, ${tileAccent} 15%, transparent)`,
                      color: tileAccent,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: isActive ? tileAccent : 'var(--color-on-surface-variant)' }}
                  >
                    {entry.manifest.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
