import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  /** Persistence key — when provided, the ratio is stored in localStorage under this key. */
  persistKey?: string;
  /** Default ratio (left fraction). 0.4 means 40/60. */
  defaultRatio?: number;
  /** Min ratio bound. Default 0.15. */
  minRatio?: number;
  /** Max ratio bound. Default 0.85. */
  maxRatio?: number;
  className?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readPersistedRatio(key: string | undefined, fallback: number): number {
  if (!key) return fallback;
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function formatPercent(value: number): string {
  // 0.4 -> "40%", 0.255 -> "25.5%"
  const pct = value * 100;
  const rounded = Math.round(pct * 100) / 100;
  return `${rounded}%`;
}

export function SplitPane({
  left,
  right,
  persistKey,
  defaultRatio = 0.4,
  minRatio = 0.15,
  maxRatio = 0.85,
  className,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const ratioRef = useRef<number>(0);

  const [ratio, setRatioState] = useState<number>(() =>
    clamp(readPersistedRatio(persistKey, defaultRatio), minRatio, maxRatio)
  );
  ratioRef.current = ratio;

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const next = clamp((event.clientX - rect.left) / rect.width, minRatio, maxRatio);
      ratioRef.current = next;
      setRatioState(next);
    },
    [minRatio, maxRatio]
  );

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    if (persistKey) {
      try {
        window.localStorage.setItem(persistKey, String(ratioRef.current));
      } catch {
        /* ignore quota / disabled storage */
      }
    }
  }, [handlePointerMove, persistKey]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      draggingRef.current = true;
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const leftBasis = formatPercent(ratio);
  const rightBasis = formatPercent(1 - ratio);

  return (
    <div
      ref={containerRef}
      className={cn('flex h-full w-full flex-col md:flex-row overflow-hidden', className)}
    >
      <div
        data-slot="left"
        className="min-h-0 min-w-0 md:h-full md:flex-shrink-0"
        style={{ flexBasis: leftBasis }}
      >
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={Math.round(minRatio * 100)}
        aria-valuemax={Math.round(maxRatio * 100)}
        onPointerDown={handlePointerDown}
        className={cn(
          'group relative shrink-0 select-none',
          // mobile: thin horizontal bar; desktop: vertical resizer
          'h-1 w-full md:h-full md:w-1',
          'bg-outline-variant/20 hover:bg-primary/30 transition-colors',
          'md:cursor-col-resize'
        )}
      />
      <div
        data-slot="right"
        className="min-h-0 min-w-0 md:h-full md:flex-1"
        style={{ flexBasis: rightBasis }}
      >
        {right}
      </div>
    </div>
  );
}
