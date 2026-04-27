import { useState, useRef, useCallback, useId, KeyboardEvent } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks/use-click-outside';

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useClickOutside(containerRef, () => setOpen(false));

  const selectedOptions = options.filter(opt => selected.includes(opt.value));
  const filteredOptions = options.filter(
    opt => !selected.includes(opt.value) && opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (value: string) => {
      onChange([...selected, value]);
      setQuery('');
      setHighlightedIndex(0);
      inputRef.current?.focus();
    },
    [selected, onChange]
  );

  const handleRemove = useCallback(
    (value: string) => {
      onChange(selected.filter(v => v !== value));
      inputRef.current?.focus();
    },
    [selected, onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const option = filteredOptions[highlightedIndex];
        if (option) {
          handleSelect(option.value);
        }
      } else if (e.key === 'Backspace' && query === '' && selected.length > 0) {
        handleRemove(selected[selected.length - 1]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [filteredOptions, highlightedIndex, query, selected, handleSelect, handleRemove]
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
        className={cn(
          'min-h-[42px] w-full rounded-lg bg-surface-container px-3 py-1.5 text-sm text-on-surface transition-all',
          'flex flex-wrap items-center gap-1.5 cursor-text',
          disabled && 'cursor-not-allowed opacity-60',
          open && 'ring-1 ring-primary/50'
        )}
      >
        {selectedOptions.map(opt => (
          <span
            key={opt.value}
            className="inline-flex items-center gap-1 rounded bg-surface-bright px-2 py-0.5 text-xs text-slate-200"
          >
            {opt.label}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleRemove(opt.value);
              }}
              className="rounded p-0.5 hover:bg-surface-container-high"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="min-w-[60px] flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline/50 outline-none"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
        />
        <ChevronDown
          className={cn('h-4 w-4 text-outline transition-transform', open && 'rotate-180')}
        />
      </div>

      {open && (
        <div
          id={listId}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-surface-container-high py-1 shadow-lg ring-1 ring-outline-variant/20"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-outline">
              {options.length === 0 ? 'No options available' : 'No matching options'}
            </div>
          ) : (
            filteredOptions.map((opt, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 transition-colors',
                    isHighlighted ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container'
                  )}
                >
                  {opt.icon && <opt.icon className="h-3.5 w-3.5" />}
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
