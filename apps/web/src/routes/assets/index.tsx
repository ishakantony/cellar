import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { toast } from 'sonner';
import { ASSET_TYPES, AssetType, type AssetSort } from '@cellar/shared';
import { AssetsToolbar } from '@/components/assets/assets-toolbar';
import { AssetsView } from '@/components/assets/assets-view';
import { ConfirmDialog } from '@cellar/ui';
import { useAssetsQuery, type AssetSummary } from '@/hooks/queries/use-assets';
import {
  useDeleteAssetMutation,
  useTogglePinAssetMutation,
} from '@/hooks/mutations/use-asset-mutations';
import { useViewMode } from '@/hooks/use-view-mode';

const SORT_VALUES = ['newest', 'oldest', 'az', 'za'] as const satisfies readonly AssetSort[];

export function AssetsListPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      type: parseAsStringLiteral(ASSET_TYPES),
      sort: parseAsStringLiteral(SORT_VALUES).withDefault('newest'),
    },
    { throttleMs: 250 }
  );
  const [viewMode, setViewMode] = useViewMode();

  const { q: searchQuery, type: selectedType, sort } = filters;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const assetsQuery = useAssetsQuery({
    type: selectedType ?? undefined,
    sort,
    q: searchQuery || undefined,
    limit: 100,
  });

  const togglePin = useTogglePinAssetMutation();
  const deleteAsset = useDeleteAssetMutation();

  const handleTogglePin = useCallback(
    async (id: string) => {
      try {
        await togglePin.mutateAsync(id);
      } catch {
        toast.error('Failed to toggle pin');
      }
    },
    [togglePin]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!assetToDelete) return;
    try {
      await deleteAsset.mutateAsync(assetToDelete);
      toast.success('Asset deleted');
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch {
      toast.error('Failed to delete asset');
    }
  }, [assetToDelete, deleteAsset]);

  const assets: AssetSummary[] = assetsQuery.data ?? [];
  const assetItems = assets.map(asset => ({
    id: asset.id,
    type: asset.type,
    title: asset.title,
    language: asset.language,
    pinned: asset.pinned,
    updatedAt: new Date(asset.updatedAt),
  }));

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
        searchQuery={searchQuery}
        onSearchChange={q => setFilters({ q })}
        selectedType={selectedType}
        onTypeChange={(type: AssetType | null) => setFilters({ type })}
        sort={sort}
        onSortChange={sort => setFilters({ sort })}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onNewAsset={() => navigate('/assets/new')}
      />

      <AssetsView
        assets={assetItems}
        view={viewMode}
        onCardClick={id => navigate(`/assets/${id}`)}
        onTogglePin={handleTogglePin}
        onDelete={id => {
          setAssetToDelete(id);
          setDeleteDialogOpen(true);
        }}
        emptyMessage={emptyMessage}
        emptyAction={
          !searchQuery.trim() && !selectedType
            ? { label: 'New Asset', onClick: () => navigate('/assets/new') }
            : undefined
        }
      />

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
