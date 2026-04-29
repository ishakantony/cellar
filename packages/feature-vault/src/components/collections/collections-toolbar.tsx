import { type RefObject } from 'react';
import { Plus } from 'lucide-react';
import { Button, SearchInput, ViewToggle } from '@cellar/ui';

export interface CollectionsToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onNewCollection: () => void;
  searchRef?: RefObject<HTMLInputElement | null>;
}

export function CollectionsToolbar({
  searchValue,
  onSearchChange,
  view,
  onViewChange,
  onNewCollection,
  searchRef,
}: CollectionsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <SearchInput
        ref={searchRef}
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search collections..."
        className="flex-1 w-full sm:w-auto"
      />
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ViewToggle view={view} onChange={onViewChange} />
        <Button onClick={onNewCollection} className="ml-auto sm:ml-0">
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </div>
    </div>
  );
}
