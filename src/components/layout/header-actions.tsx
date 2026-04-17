'use client';

import { FolderPlus, SquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HeaderActionsProps {
  onAddCollection: () => void;
  onAddItem: () => void;
  collectionLabel?: string;
  itemLabel?: string;
  loading?: boolean;
  className?: string;
}

export function HeaderActions({
  onAddCollection,
  onAddItem,
  collectionLabel = 'Collection',
  itemLabel = 'Add Item',
  loading = false,
  className,
}: HeaderActionsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Desktop - with text */}
      <Button
        onClick={onAddCollection}
        variant="ghost"
        size="sm"
        className="hidden sm:flex"
        disabled={loading}
      >
        <FolderPlus className="h-4 w-4" />
        {collectionLabel}
      </Button>
      <Button
        onClick={onAddItem}
        variant="primary"
        size="sm"
        className="hidden sm:flex"
        disabled={loading}
      >
        <SquarePlus className="h-4 w-4" />
        {itemLabel}
      </Button>

      {/* Mobile - icon only */}
      <Button
        onClick={onAddCollection}
        variant="ghost"
        size="sm"
        className="sm:hidden"
        disabled={loading}
      >
        <FolderPlus className="h-4 w-4" />
      </Button>
      <Button
        onClick={onAddItem}
        variant="primary"
        size="sm"
        className="sm:hidden"
        disabled={loading}
      >
        <SquarePlus className="h-4 w-4" />
      </Button>
    </div>
  );
}
