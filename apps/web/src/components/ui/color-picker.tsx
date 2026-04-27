import { cn } from '@/lib/utils';

export interface ColorPickerOption {
  value: string;
  label: string;
}

export const DEFAULT_COLOR_OPTIONS: ColorPickerOption[] = [
  { value: '#f97316', label: 'Orange' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#d946ef', label: 'Fuchsia' },
  { value: '#ec4899', label: 'Pink' },
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
