'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { AssetType } from '@/generated/prisma/enums';
import { getAssets, togglePin, deleteAsset } from '@/app/actions/assets';
import { AssetsToolbar } from '@/components/assets/assets-toolbar';
import { AssetsView } from '@/components/assets/assets-view';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface AssetItem {
  id: string;
  type: AssetType;
  title: string;
  language: string | null;
  pinned: boolean;
  updatedAt: Date;
}

interface AssetsClientProps {
  initialAssets: AssetItem[];
  initialHasMore: boolean;
}

export function AssetsClient({ initialAssets, initialHasMore }: AssetsClientProps) {
  const router = useRouter();
  const [assets, setAssets] = useState<AssetItem[]>(initialAssets);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useQueryState('q', {
    defaultValue: '',
    throttleMs: 300,
    shallow: false,
  });
  const [selectedType, setSelectedType] = useQueryState<AssetType | null>('type', {
    defaultValue: null,
    parse: value => (value as AssetType) || null,
    serialize: value => value || '',
    shallow: false,
  });
  const [sort, setSort] = useQueryState<'newest' | 'oldest' | 'az' | 'za'>('sort', {
    defaultValue: 'newest',
    parse: value => (value as 'newest' | 'oldest' | 'az' | 'za') || 'newest',
    shallow: false,
  });

  // Refetch when filters change (reset pagination)
  useEffect(() => {
    setAssets(initialAssets);
    setHasMore(initialHasMore);
  }, [initialAssets, initialHasMore]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextAssets = await getAssets({
        type: selectedType || undefined,
        sort: sort || undefined,
        q: searchQuery || undefined,
        limit: 20,
        offset: assets.length,
      });
      const casted = nextAssets as AssetItem[];
      setAssets(prev => [...prev, ...casted]);
      setHasMore(casted.length === 20);
    } catch {
      toast.error('Failed to load more assets');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, selectedType, sort, searchQuery, assets.length]);

  const handleTogglePin = useCallback(async (id: string) => {
    // Optimistic update
    setAssets(prev => prev.map(a => (a.id === id ? { ...a, pinned: !a.pinned } : a)));
    try {
      await togglePin(id);
    } catch {
      // Rollback
      setAssets(prev => prev.map(a => (a.id === id ? { ...a, pinned: !a.pinned } : a)));
      toast.error('Failed to toggle pin');
    }
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setAssetToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!assetToDelete) return;
    try {
      await deleteAsset(assetToDelete);
      toast.success('Asset deleted');
      setAssets(prev => prev.filter(a => a.id !== assetToDelete));
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch {
      toast.error('Failed to delete asset');
    }
  }, [assetToDelete]);

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/assets/${id}`);
    },
    [router]
  );

  const emptyMessage = searchQuery.trim()
    ? 'No assets match your search.'
    : selectedType
      ? `No ${selectedType.toLowerCase()} assets yet.`
      : 'No assets yet. Create your first asset to get started.';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Assets</h1>
        <p className="text-xs text-outline mt-1">Browse and manage your vault</p>
      </div>

      <AssetsToolbar
        searchQuery={searchQuery || ''}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sort={sort || 'newest'}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onNewAsset={() => router.push('/assets/new')}
      />

      <AssetsView
        assets={assets}
        view={viewMode}
        onCardClick={handleCardClick}
        onTogglePin={handleTogglePin}
        onDelete={handleDeleteClick}
        emptyMessage={emptyMessage}
        emptyAction={
          !searchQuery.trim() && !selectedType
            ? { label: 'New Asset', onClick: () => router.push('/assets/new') }
            : undefined
        }
      />

      {hasMore && assets.length > 0 && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAssetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
