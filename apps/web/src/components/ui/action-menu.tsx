import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger: React.ReactNode;
  align?: 'left' | 'right';
}

export function ActionMenu({ items, trigger, align = 'right' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setOpen(false), open);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 w-40 bg-surface-container-high rounded-lg shadow-xl border border-white/10 py-1 z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={e => {
                  e.stopPropagation();
                  item.onClick();
                  setOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors',
                  item.variant === 'danger'
                    ? 'text-error hover:bg-error/10'
                    : 'text-on-surface-variant hover:bg-surface-bright'
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
