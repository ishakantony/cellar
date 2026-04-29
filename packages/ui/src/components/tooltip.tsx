import { useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'start' | 'center' | 'end';
  /** Side of the trigger to position the tooltip on. Defaults to "top". */
  side?: TooltipSide;
  /** When true, the tooltip is suppressed and never opens. */
  disabled?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'center',
  side = 'top',
  disabled = false,
  className,
}: TooltipProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !tooltipRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    const gap = 6;
    const margin = 4;

    let left: number;
    let top: number;

    if (side === 'right' || side === 'left') {
      // For horizontal sides, `placement` orients along the vertical axis.
      if (placement === 'start') top = trigger.top;
      else if (placement === 'end') top = trigger.bottom - tip.height;
      else top = trigger.top + trigger.height / 2 - tip.height / 2;

      top = Math.max(margin, Math.min(top, window.innerHeight - tip.height - margin));
      left = side === 'right' ? trigger.right + gap : trigger.left - tip.width - gap;
    } else {
      // top / bottom — placement orients along the horizontal axis.
      if (placement === 'start') left = trigger.left;
      else if (placement === 'end') left = trigger.right - tip.width;
      else left = trigger.left + trigger.width / 2 - tip.width / 2;

      left = Math.max(margin, Math.min(left, window.innerWidth - tip.width - margin));
      top = side === 'bottom' ? trigger.bottom + gap : trigger.top - tip.height - gap;
    }

    setPos({ top, left });
  }, [open, placement, side, content]);

  const isOpen = open && !disabled;

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-flex', className)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
            className="fixed px-2 py-1 rounded bg-surface-bright border border-white/10 text-xs text-slate-100 whitespace-nowrap pointer-events-none z-[9999]"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
