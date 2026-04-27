import { Plus } from 'lucide-react';
import { AssetType } from '@cellar/shared';
import { SearchInput } from '@/components/ui/search-input';
import { Tabs } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TYPE_TAB_OPTIONS = [
  { value: null as string | null, label: 'All' },
  { value: 'SNIPPET', label: 'Snippet' },
  { value: 'PROMPT', label: 'Prompt' },
  { value: 'NOTE', label: 'Note' },
  { value: 'LINK', label: 'Link' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'FILE', label: 'File' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
];

export interface AssetsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: AssetType | null;
  onTypeChange: (type: AssetType | null) => void;
  sort: 'newest' | 'oldest' | 'az' | 'za';
  onSortChange: (sort: 'newest' | 'oldest' | 'az' | 'za') => void;
  viewMode: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onNewAsset: () => void;
  className?: string;
}

export function AssetsToolbar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  sort,
  onSortChange,
  viewMode,
  onViewChange,
  onNewAsset,
  className,
}: AssetsToolbarProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchInput
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
        <Button onClick={onNewAsset} className="hidden sm:flex">
          <Plus className="h-4 w-4 mr-1" />
          New Asset
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Tabs
          value={selectedType}
          options={TYPE_TAB_OPTIONS}
          onChange={val => onTypeChange(val as AssetType | null)}
        />
        <Button onClick={onNewAsset} size="sm" className="sm:hidden">
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
    </div>
  );
}
