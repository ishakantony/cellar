import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { CollectionCard } from './collection-card';

interface CollectionItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  pinned: boolean;
  _count: { assets: number };
}

export interface CollectionsViewProps {
  collections: CollectionItem[];
  view: 'grid' | 'list';
  onCardClick: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function CollectionsView({
  collections,
  view,
  onCardClick,
  onTogglePin,
  onEdit,
  onDelete,
  emptyMessage = 'No collections found.',
  emptyAction,
  className,
}: CollectionsViewProps) {
  if (collections.length === 0) {
    return <EmptyState message={emptyMessage} action={emptyAction} className={className} />;
  }

  return (
    <div
      className={cn(
        view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'flex flex-col gap-2',
        className
      )}
    >
      {collections.map(collection => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          layout={view}
          onClick={() => onCardClick(collection.id)}
          onTogglePin={() => onTogglePin(collection.id)}
          onEdit={() => onEdit(collection.id)}
          onDelete={() => onDelete(collection.id)}
        />
      ))}
    </div>
  );
}
