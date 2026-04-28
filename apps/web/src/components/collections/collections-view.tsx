import { EmptyState, cn } from '@cellar/ui';
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

  const pinned = collections.filter(c => c.pinned);
  const unpinned = collections.filter(c => !c.pinned);
  const showSections = pinned.length > 0 && unpinned.length > 0;

  const containerClass = cn(
    view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-2'
  );

  const renderCard = (collection: CollectionItem) => (
    <CollectionCard
      key={collection.id}
      collection={collection}
      layout={view}
      onClick={() => onCardClick(collection.id)}
      onTogglePin={() => onTogglePin(collection.id)}
      onEdit={() => onEdit(collection.id)}
      onDelete={() => onDelete(collection.id)}
    />
  );

  if (!showSections) {
    return <div className={cn(containerClass, className)}>{collections.map(renderCard)}</div>;
  }

  return (
    <div className={className}>
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-outline">Pinned</h2>
      <div className={containerClass}>{pinned.map(renderCard)}</div>
      <h2 className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wide text-outline">
        All collections
      </h2>
      <div className={containerClass}>{unpinned.map(renderCard)}</div>
    </div>
  );
}
