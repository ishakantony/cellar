import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { toast } from 'sonner';
import { type AssetSort, type AssetType } from '@cellar/shared';
import { SLUG_TO_TYPE, TYPE_TO_SLUG } from '../../lib/asset-types';
import { AssetsFilterTabs } from '../../components/assets/assets-filter-tabs';
import { AssetsToolbar } from '../../components/assets/assets-toolbar';
import { AssetsView } from '../../components/assets/assets-view';
import { ConfirmDialog, TextLink } from '@cellar/ui';
import { useAssetsQuery, type AssetSummary } from '../../hooks/queries/use-assets';
import {
  useDeleteAssetMutation,
  useTogglePinAssetMutation,
} from '../../hooks/mutations/use-asset-mutations';
import { useViewMode } from '../../hooks/use-view-mode';
import { useAssetDrawer } from '../../hooks/use-asset-drawer';
import { useSlashFocus } from '../../hooks/use-slash-focus';

const SORT_VALUES = ['newest', 'oldest', 'az', 'za'] as const satisfies readonly AssetSort[];

export function AssetsListPage() {
  const { openCreate } = useAssetDrawer();
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashFocus(searchRef);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Derive the selected asset type from the URL path segment (e.g. /vault/assets/snippets → SNIPPET).
  const slug = pathname.split('/').pop();
  const selectedType: AssetType | null = (slug && SLUG_TO_TYPE[slug]) ?? null;

  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      sort: parseAsStringLiteral(SORT_VALUES).withDefault('newest'),
    },
    { throttleMs: 250 }
  );
  const [viewMode, setViewMode] = useViewMode();

  const { q: searchQuery, sort } = filters;

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

  function handleTypeChange(type: AssetType | null) {
    const typeSlug = type ? TYPE_TO_SLUG[type] : null;
    const path = typeSlug ? `/vault/assets/${typeSlug}` : '/vault/assets';
    // Preserve q and sort in the URL when switching types.
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (sort !== 'newest') params.set('sort', sort);
    const search = params.toString();
    navigate(search ? `${path}?${search}` : path);
  }

  const assets: AssetSummary[] = assetsQuery.data ?? [];
  const assetItems = assets.map(asset => ({
    id: asset.id,
    type: asset.type,
    title: asset.title,
    language: asset.language,
    pinned: asset.pinned,
    updatedAt: new Date(asset.updatedAt),
  }));

  const emptyMessage: ReactNode = searchQuery.trim() ? (
    'No assets match your search.'
  ) : selectedType ? (
    `No ${selectedType.toLowerCase()} assets yet.`
  ) : (
    <>
      No assets yet. <TextLink onClick={() => openCreate()}>Create</TextLink> your first asset to
      get started.
    </>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Assets</h1>
        <p className="text-xs text-outline mt-1">Browse and manage your vault</p>
      </div>

      <AssetsToolbar
        searchQuery={searchQuery}
        onSearchChange={q => setFilters({ q })}
        sort={sort}
        onSortChange={sort => setFilters({ sort })}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onNewAsset={() => openCreate()}
        searchRef={searchRef}
      />

      <AssetsFilterTabs
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        className="mt-3 mb-4"
      />

      <AssetsView
        assets={assetItems}
        view={viewMode}
        onTogglePin={handleTogglePin}
        onDelete={id => {
          setAssetToDelete(id);
          setDeleteDialogOpen(true);
        }}
        emptyMessage={emptyMessage}
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
