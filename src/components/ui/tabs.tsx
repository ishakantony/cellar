'use client';

import { cn } from '@/lib/utils';

export interface TabOption {
  value: string | null;
  label: string;
}

export interface TabsProps {
  value: string | null;
  options: TabOption[];
  onChange: (value: string | null) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function Tabs({ value, options, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 overflow-x-auto', className)}>
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-outline hover:text-on-surface-variant hover:bg-surface-container'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
