import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HeaderActionsProps {
  onAddCollection: () => void;
  collectionLabel?: string;
  loading?: boolean;
  className?: string;
}

export function HeaderActions({
  onAddCollection,
  collectionLabel = 'Collection',
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
    </div>
  );
}
