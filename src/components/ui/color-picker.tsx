'use client';

import { cn } from '@/lib/utils';

export interface ColorPickerOption {
  value: string;
  label: string;
}

export const DEFAULT_COLOR_OPTIONS: ColorPickerOption[] = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#22c55e', label: 'Green' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#d946ef', label: 'Fuchsia' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#6b7280', label: 'Gray' },
  { value: '#1f2937', label: 'Dark' },
];

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  options?: ColorPickerOption[];
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  options = DEFAULT_COLOR_OPTIONS,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 w-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface',
            value === option.value
              ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary scale-110'
              : 'hover:scale-105'
          )}
          style={{ backgroundColor: option.value }}
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
        />
      ))}
    </div>
  );
}
