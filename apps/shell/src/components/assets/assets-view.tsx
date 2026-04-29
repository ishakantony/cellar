import type { ReactNode } from 'react';
import { EmptyState, cn } from '@cellar/ui';
import { AssetCard } from './asset-card';
import { AssetCardSkeleton } from './asset-card-skeleton';
import type { AssetType } from '@cellar/shared';

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
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: ReactNode;
  loading?: boolean;
}

export function AssetsView({
  assets,
  view,
  onTogglePin,
  onDelete,
  emptyMessage,
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
    return <EmptyState message={emptyMessage} className="mt-12" />;
  }

  const pinned = assets.filter(a => a.pinned);
  const unpinned = assets.filter(a => !a.pinned);

  const gridClass = cn(
    'grid gap-3',
    view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
  );

  const renderCard = (asset: AssetItem) => (
    <AssetCard
      key={asset.id}
      asset={asset}
      onTogglePin={() => onTogglePin(asset.id)}
      onDelete={() => onDelete(asset.id)}
      compact={view === 'list'}
    />
  );

  if (pinned.length === 0) {
    return <div className={cn(gridClass, 'mt-6')}>{unpinned.map(renderCard)}</div>;
  }

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-outline">Pinned</h2>
      <div className={gridClass}>{pinned.map(renderCard)}</div>
      {unpinned.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-outline">All</h2>
          <div className={gridClass}>{unpinned.map(renderCard)}</div>
        </div>
      )}
    </div>
  );
}
