import { type RefObject } from 'react';
import { Plus } from 'lucide-react';
import { Button, SearchInput, Select, ViewToggle, cn } from '@cellar/ui';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
];

export interface AssetsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sort: 'newest' | 'oldest' | 'az' | 'za';
  onSortChange: (sort: 'newest' | 'oldest' | 'az' | 'za') => void;
  viewMode: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onNewAsset: () => void;
  className?: string;
  searchRef?: RefObject<HTMLInputElement | null>;
}

export function AssetsToolbar({
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
  viewMode,
  onViewChange,
  onNewAsset,
  className,
  searchRef,
}: AssetsToolbarProps) {
  return (
    <div className={cn('flex items-center gap-3 flex-wrap', className)}>
      <div className="flex-1 min-w-[200px]">
        <SearchInput
          ref={searchRef}
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search assets..."
        />
      </div>
      <Select
        value={sort}
        options={SORT_OPTIONS}
        onChange={val => onSortChange(val as 'newest' | 'oldest' | 'az' | 'za')}
      />
      <ViewToggle view={viewMode} onChange={onViewChange} />
      <Button onClick={onNewAsset}>
        <Plus className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">New Asset</span>
        <span className="sm:hidden">New</span>
      </Button>
    </div>
  );
}
