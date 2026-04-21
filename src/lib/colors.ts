export const COLLECTION_COLORS: Record<string, string> = {
  '#f97316': 'bg-orange-500/15 text-orange-400',
  '#84cc16': 'bg-lime-500/15 text-lime-400',
  '#10b981': 'bg-emerald-500/15 text-emerald-400',
  '#3b82f6': 'bg-blue-500/15 text-blue-400',
  '#d946ef': 'bg-fuchsia-500/15 text-fuchsia-400',
  '#ec4899': 'bg-pink-500/15 text-pink-400',
};

export const COLOR_OPTIONS = [
  { value: '#f97316', label: 'Orange', className: 'bg-orange-500' },
  { value: '#84cc16', label: 'Lime', className: 'bg-lime-500' },
  { value: '#10b981', label: 'Emerald', className: 'bg-emerald-500' },
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#d946ef', label: 'Fuchsia', className: 'bg-fuchsia-500' },
  { value: '#ec4899', label: 'Pink', className: 'bg-pink-500' },
];

export function getColorClasses(color: string | null | undefined): string {
  if (color && COLLECTION_COLORS[color]) return COLLECTION_COLORS[color];
  return 'bg-blue-500/15 text-blue-400';
}
