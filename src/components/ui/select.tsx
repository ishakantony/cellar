'use client';

import { useState, useRef, useCallback, useId, KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';

export interface SelectOption<T> {
  value: T;
  label: string;
}

export interface SelectProps<T> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  className,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useClickOutside(containerRef, () => setOpen(false));

  const selectedLabel = options.find(opt => opt.value === value)?.label || value;
  const selectedIndex = options.findIndex(opt => opt.value === value);

  const handleSelect = useCallback(
    (val: T) => {
      onChange(val);
      setOpen(false);
      setHighlightedIndex(0);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
          setHighlightedIndex(i => Math.min(i + 1, options.length - 1));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (open) {
          const option = options[highlightedIndex];
          if (option) {
            handleSelect(option.value as T);
          }
        } else {
          setOpen(true);
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, highlightedIndex, options, handleSelect, selectedIndex]
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between gap-2 rounded-lg bg-surface-container px-3 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-all min-w-[120px]',
          'cursor-pointer outline-none focus:ring-1 focus:ring-primary/50',
          open && 'ring-1 ring-primary/50',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-outline flex-shrink-0 transition-transform',
            open && 'rotate-180'
          )}
        />
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-surface-container-high py-1 shadow-lg ring-1 ring-outline-variant/20"
        >
          {options.map((opt, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value as T)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : isHighlighted
                      ? 'bg-surface-container text-slate-200'
                      : 'text-slate-200 hover:bg-surface-container'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
