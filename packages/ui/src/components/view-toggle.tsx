import { LayoutGrid, List } from 'lucide-react';
import { cn } from '../lib/cn';
import { IconButton } from './icon-button';

export interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-1 bg-surface-container rounded-lg p-1', className)}>
      <IconButton
        icon={LayoutGrid}
        size="sm"
        variant={view === 'grid' ? 'default' : 'ghost'}
        onClick={() => onChange('grid')}
        label="Grid view"
        className={cn(view === 'grid' && 'bg-surface-bright text-slate-100')}
      />
      <IconButton
        icon={List}
        size="sm"
        variant={view === 'list' ? 'default' : 'ghost'}
        onClick={() => onChange('list')}
        label="List view"
        className={cn(view === 'list' && 'bg-surface-bright text-slate-100')}
      />
    </div>
  );
}
