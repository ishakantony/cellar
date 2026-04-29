import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { FolderPlus, Pin } from 'lucide-react';
import { ASSET_TYPES } from '@cellar/shared';
import { Button } from '@cellar/ui';
import { TYPE_CONFIG } from '../lib/asset-types';
import { useDashboardQuery } from '../hooks/queries/use-dashboard';
import { useAssetDrawer } from '../hooks/use-asset-drawer';
import { useCollectionModal } from '../hooks/use-collection-modal';
import {
  useTogglePinAssetMutation,
  useDeleteAssetMutation,
} from '../hooks/mutations/use-asset-mutations';
import {
  useToggleCollectionPinMutation,
  useDeleteCollectionMutation,
} from '../hooks/mutations/use-collection-mutations';
import { AssetCard } from '../components/assets/asset-card';
import { CollectionCard } from '../components/collections/collection-card';
import { ConfirmDialog } from '@cellar/ui';

// ---------------------------------------------------------------------------
// Quick-capture row
// ---------------------------------------------------------------------------

const COLLECTION_CAPTURE = {
  key: 'collection',
  label: 'Collection',
  iconWrap: 'bg-teal-500/10 text-teal-400',
} as const;

function QuickCaptureRow() {
  const { openCreate: openAssetCreate } = useAssetDrawer();
  const { openCreate: openCollectionCreate } = useCollectionModal();

  return (
    <section>
      <h2 className="mb-3 text-[10px] font-bold uppercase tracking-wide text-outline">
        Quick capture
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {ASSET_TYPES.map(type => {
          const config = TYPE_CONFIG[type];
          const Icon = config.icon;
          return (
            <button
              key={type}
              onClick={() => openAssetCreate({ type })}
              className="flex flex-col items-center gap-2.5 rounded-xl py-4 px-2 border border-white/5 bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className={`rounded-lg p-2 ${config.iconWrap}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">{config.label}</span>
            </button>
          );
        })}
        <button
          onClick={openCollectionCreate}
          className={`flex flex-col items-center gap-2.5 rounded-xl py-4 px-2 border border-white/5 bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer`}
        >
          <div className={`rounded-lg p-2 ${COLLECTION_CAPTURE.iconWrap}`}>
            <FolderPlus className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-slate-300">{COLLECTION_CAPTURE.label}</span>
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Overview bento
// ---------------------------------------------------------------------------

interface OverviewBentoProps {
  total: number;
  pinnedCount: number;
  collectionCount: number;
  byType: Record<string, number>;
}

function BigStatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/5 bg-surface-container p-4 flex flex-col items-center justify-center gap-2 text-center ${className ?? ''}`}
    >
      <p className="text-[10px] uppercase tracking-wide text-outline">{label}</p>
      <p className="text-4xl font-bold text-slate-100">{value}</p>
    </div>
  );
}

function OverviewBento({ total, pinnedCount, collectionCount, byType }: OverviewBentoProps) {
  return (
    <section>
      <h2 className="mb-3 text-[10px] font-bold uppercase tracking-wide text-outline">Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="stats-strip">
        {/* Left: summary stats — total + collections stacked, pinned beside them */}
        <div className="grid grid-cols-2 gap-3">
          <BigStatCard label="Total assets" value={total} />
          {/* Pinned spans both rows on col 2 */}
          <div className="rounded-xl border border-white/5 bg-surface-container p-4 row-span-2 flex flex-col items-center justify-center gap-4">
            <div className="rounded-2xl p-4 bg-amber-500/10 text-amber-400">
              <Pin className="h-10 w-10" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold text-slate-100">{pinnedCount}</p>
              <p className="text-[10px] uppercase tracking-wide text-outline">Pinned</p>
            </div>
          </div>
          <BigStatCard label="Total collections" value={collectionCount} />
        </div>

        {/* Right: per-type breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {ASSET_TYPES.map(type => {
            const config = TYPE_CONFIG[type];
            const Icon = config.icon;
            return (
              <div
                key={type}
                className="rounded-xl border border-white/5 bg-surface-container p-3 grid grid-cols-2 items-center"
              >
                <div className={`rounded-xl p-2.5 justify-self-center ${config.iconWrap}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-center justify-self-center">
                  <p className="text-2xl font-bold text-slate-100">{byType[type] ?? 0}</p>
                  <p className="text-[10px] text-outline">{config.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section heading
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[10px] font-bold uppercase tracking-wide text-outline">{children}</h2>
  );
}

function EmptyHint({ message }: { message: string }) {
  return <p className="text-[11px] text-outline py-4">{message}</p>;
}

// ---------------------------------------------------------------------------
// Empty vault state
// ---------------------------------------------------------------------------

function EmptyVault() {
  const { openCreate: openAssetCreate } = useAssetDrawer();
  const { openCreate: openCollectionCreate } = useCollectionModal();

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-4xl">📦</div>
      <div>
        <p className="text-sm font-semibold text-slate-200">Your vault is empty</p>
        <p className="text-xs text-outline mt-1 max-w-xs">
          Start by adding a snippet, note, or link — or create a collection to organise your assets.
        </p>
      </div>
      <div className="flex gap-2 mt-2">
        <Button variant="primary" size="sm" onClick={() => openAssetCreate()}>
          New Asset
        </Button>
        <Button variant="secondary" size="sm" onClick={openCollectionCreate}>
          New Collection
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export function VaultHomePage() {
  const navigate = useNavigate();
  const dashboardQuery = useDashboardQuery();

  const togglePinAsset = useTogglePinAssetMutation();
  const deleteAsset = useDeleteAssetMutation();
  const togglePinCollection = useToggleCollectionPinMutation();
  const deleteCollection = useDeleteCollectionMutation();
  const { openEdit: openCollectionEdit } = useCollectionModal();

  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);

  const handleTogglePinAsset = useCallback(
    async (id: string) => {
      try {
        await togglePinAsset.mutateAsync(id);
      } catch {
        toast.error('Failed to toggle pin');
      }
    },
    [togglePinAsset]
  );

  const handleConfirmDeleteAsset = useCallback(async () => {
    if (!deleteAssetId) return;
    try {
      await deleteAsset.mutateAsync(deleteAssetId);
      toast.success('Asset deleted');
      setDeleteAssetId(null);
    } catch {
      toast.error('Failed to delete asset');
    }
  }, [deleteAsset, deleteAssetId]);

  const handleTogglePinCollection = useCallback(
    async (id: string) => {
      try {
        await togglePinCollection.mutateAsync(id);
      } catch {
        toast.error('Failed to toggle pin');
      }
    },
    [togglePinCollection]
  );

  const handleConfirmDeleteCollection = useCallback(async () => {
    if (!deleteCollectionId) return;
    try {
      await deleteCollection.mutateAsync(deleteCollectionId);
      toast.success('Collection deleted');
      setDeleteCollectionId(null);
    } catch {
      toast.error('Failed to delete collection');
    }
  }, [deleteCollection, deleteCollectionId]);

  if (dashboardQuery.isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Dashboard</h1>
          <p className="text-xs text-outline mt-1">Loading your vault…</p>
        </div>
        <QuickCaptureRow />
      </div>
    );
  }

  const data = dashboardQuery.data;
  const counts = data?.counts ?? { total: 0, byType: {}, pinnedCount: 0 };
  const pinnedAssets = (data?.pinnedAssets ?? []).slice(0, 6);
  const pinnedCollections = (data?.pinnedCollections ?? []).slice(0, 6);
  const recentAssets = (data?.recentAssets ?? []).slice(0, 10);
  const collectionCount = pinnedCollections.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Dashboard</h1>
        <p className="text-xs text-outline mt-1">Welcome back — here's your vault at a glance</p>
      </div>

      <QuickCaptureRow />

      {counts.total === 0 ? (
        <EmptyVault />
      ) : (
        <>
          <OverviewBento
            total={counts.total}
            pinnedCount={counts.pinnedCount}
            collectionCount={collectionCount}
            byType={counts.byType}
          />

          {/* Pinned panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pinned assets */}
            <section>
              <SectionHeading>Pinned assets</SectionHeading>
              {pinnedAssets.length === 0 ? (
                <EmptyHint message="No pinned assets yet — pin any asset to see it here." />
              ) : (
                <div className="grid grid-cols-1 gap-2" data-testid="pinned-assets">
                  {pinnedAssets.map(asset => (
                    <AssetCard
                      key={asset.id}
                      asset={{
                        id: asset.id,
                        type: asset.type,
                        title: asset.title,
                        language: asset.language,
                        pinned: asset.pinned,
                        updatedAt: new Date(asset.updatedAt),
                      }}
                      compact
                      onTogglePin={() => handleTogglePinAsset(asset.id)}
                      onDelete={() => setDeleteAssetId(asset.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Pinned collections */}
            <section>
              <SectionHeading>Pinned collections</SectionHeading>
              {pinnedCollections.length === 0 ? (
                <EmptyHint message="No pinned collections yet — pin a collection to see it here." />
              ) : (
                <div className="grid grid-cols-1 gap-2" data-testid="pinned-collections">
                  {pinnedCollections.map(col => (
                    <CollectionCard
                      key={col.id}
                      collection={{
                        id: col.id,
                        name: col.name,
                        description: col.description,
                        color: col.color,
                        pinned: col.pinned,
                        _count: { assets: col.assetCount },
                      }}
                      layout="list"
                      onClick={() => navigate(`/vault/collections/${col.id}`)}
                      onTogglePin={() => handleTogglePinCollection(col.id)}
                      onEdit={() => openCollectionEdit(col.id)}
                      onDelete={() => setDeleteCollectionId(col.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Recent activity */}
          <section>
            <SectionHeading>Recent activity</SectionHeading>
            {recentAssets.length === 0 ? (
              <EmptyHint message="No recent activity." />
            ) : (
              <div className="grid grid-cols-1 gap-2" data-testid="recent-assets">
                {recentAssets.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={{
                      id: asset.id,
                      type: asset.type,
                      title: asset.title,
                      language: asset.language,
                      pinned: asset.pinned,
                      updatedAt: new Date(asset.updatedAt),
                    }}
                    compact
                    onTogglePin={() => handleTogglePinAsset(asset.id)}
                    onDelete={() => setDeleteAssetId(asset.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={!!deleteAssetId}
        onClose={() => setDeleteAssetId(null)}
        onConfirm={handleConfirmDeleteAsset}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteCollectionId}
        onClose={() => setDeleteCollectionId(null)}
        onConfirm={handleConfirmDeleteCollection}
        title="Delete Collection"
        message="Are you sure you want to delete this collection? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
