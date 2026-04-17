export const COLLECTION_COLORS: Record<string, string> = {
  '#3b82f6': 'bg-blue-500/15 text-blue-400',
  '#a855f7': 'bg-purple-500/15 text-purple-400',
  '#10b981': 'bg-emerald-500/15 text-emerald-400',
  '#f59e0b': 'bg-amber-500/15 text-amber-400',
  '#ef4444': 'bg-red-500/15 text-red-400',
  '#ec4899': 'bg-pink-500/15 text-pink-400',
};

export const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#a855f7', label: 'Purple', className: 'bg-purple-500' },
  { value: '#10b981', label: 'Green', className: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Amber', className: 'bg-amber-500' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  { value: '#ec4899', label: 'Pink', className: 'bg-pink-500' },
];

export function getColorClasses(color: string | null | undefined): string {
  if (color && COLLECTION_COLORS[color]) return COLLECTION_COLORS[color];
  return 'bg-blue-500/15 text-blue-400';
}
