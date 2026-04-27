import { EmptyState, cn } from '@cellar/ui';
import { AssetCard } from './asset-card';
import { AssetCardSkeleton } from './asset-card-skeleton';
import { AssetType } from '@cellar/shared';

interface AssetItem {
  id: string;
  type: AssetType;
  title: string;
  language?: string | null;
  pinned: boolean;
  updatedAt: Date;
}

export interface AssetsViewProps {
  assets: AssetItem[];
  view: 'grid' | 'list';
  onCardClick: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
  emptyAction?: { label: string; onClick: () => void };
  loading?: boolean;
}

export function AssetsView({
  assets,
  view,
  onCardClick,
  onTogglePin,
  onDelete,
  emptyMessage,
  emptyAction,
  loading,
}: AssetsViewProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid gap-3 mt-6',
          view === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <AssetCardSkeleton key={i} compact={view === 'list'} />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return <EmptyState message={emptyMessage} action={emptyAction} className="mt-12" />;
  }

  return (
    <div
      className={cn(
        'grid gap-3 mt-6',
        view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
      )}
    >
      {assets.map(asset => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onClick={() => onCardClick(asset.id)}
          onTogglePin={() => onTogglePin(asset.id)}
          onDelete={() => onDelete(asset.id)}
          compact={view === 'list'}
        />
      ))}
    </div>
  );
}
