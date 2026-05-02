import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { ASSET_TYPES } from '@cellar/shared';
import { ConfirmDialog, SectionHeader, cn } from '@cellar/ui';
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

const VAULT_ACCENT = 'var(--color-vault-accent)';

// ---------------------------------------------------------------------------
// Quick-capture row — horizontal pill bar + amber primary CTA
// ---------------------------------------------------------------------------

function QuickCaptureRow() {
  const { openCreate: openAssetCreate } = useAssetDrawer();

  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="shrink-0 text-xs font-medium text-on-surface-faint">Add to vault</span>
        <span className="h-4 w-px shrink-0 bg-outline-variant" aria-hidden="true" />
        <div className="flex flex-1 flex-wrap gap-1.5">
          {ASSET_TYPES.map(type => {
            const config = TYPE_CONFIG[type];
            const Icon = config.icon;
            return (
              <button
                key={type}
                type="button"
                onClick={() => openAssetCreate({ type })}
                className={cn(
                  'group flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium',
                  'border border-outline-variant text-on-surface-muted',
                  'transition-colors'
                )}
                style={
                  {
                    ['--type-color' as string]: config.color,
                  } as React.CSSProperties
                }
                onMouseEnter={e => {
                  e.currentTarget.style.background = `color-mix(in srgb, ${config.color} 10%, transparent)`;
                  e.currentTarget.style.borderColor = `color-mix(in srgb, ${config.color} 35%, transparent)`;
                  e.currentTarget.style.color = config.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => openAssetCreate()}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: VAULT_ACCENT }}
        >
          <Plus className="h-3 w-3" />
          New asset
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Vault breakdown — segmented bar + 6-up tile grid
// ---------------------------------------------------------------------------

interface VaultBreakdownProps {
  total: number;
  byType: Partial<Record<(typeof ASSET_TYPES)[number], number>>;
}

function VaultBreakdown({ total, byType }: VaultBreakdownProps) {
  const safeTotal = Math.max(total, 1);

  return (
    <section className="mb-7">
      <SectionHeader title="Your vault" count={total} />

      {/* Segmented bar */}
      <div className="mb-4 flex h-1.5 gap-px overflow-hidden rounded-full">
        {ASSET_TYPES.map(type => {
          const config = TYPE_CONFIG[type];
          const count = byType[type] ?? 0;
          if (count === 0) return null;
          return (
            <span
              key={type}
              className="block"
              style={{ flex: count, background: config.color }}
              aria-label={`${config.label}: ${count}`}
            />
          );
        })}
      </div>

      {/* 6-up grid */}
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        data-testid="vault-breakdown"
      >
        {ASSET_TYPES.map(type => {
          const config = TYPE_CONFIG[type];
          const Icon = config.icon;
          const count = byType[type] ?? 0;
          return (
            <div
              key={type}
              className={cn(
                'group rounded-lg border border-outline-variant bg-surface-container-high p-3.5',
                'transition-colors hover:bg-surface-container-highest'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{
                    background: `color-mix(in srgb, ${config.color} 18%, transparent)`,
                    color: config.color,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-lg font-bold tracking-tight text-foreground">{count}</span>
              </div>
              <p className="text-[11px] font-medium text-on-surface-variant">{config.label}s</p>
              <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-surface-bright">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(count / safeTotal) * 100}%`,
                    background: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Empty vault state
// ---------------------------------------------------------------------------

function EmptyVault() {
  const { openCreate: openAssetCreate } = useAssetDrawer();
  const { openCreate: openCollectionCreate } = useCollectionModal();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="text-4xl">📦</div>
      <div>
        <p className="text-sm font-semibold text-foreground">Your vault is empty</p>
        <p className="mt-1 max-w-xs text-xs text-on-surface-faint">
          Start by adding a snippet, note, or link — or create a collection to organise your assets.
        </p>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => openAssetCreate()}
          className="rounded-md px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: VAULT_ACCENT }}
        >
          New Asset
        </button>
        <button
          type="button"
          onClick={openCollectionCreate}
          className="rounded-md border border-outline px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          New Collection
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recently accessed — compact table
// ---------------------------------------------------------------------------

interface RecentRow {
  id: string;
  type: keyof typeof TYPE_CONFIG;
  title: string;
  pinned: boolean;
  language?: string | null;
  updatedAt: Date;
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function RecentTable({ rows, onView }: { rows: RecentRow[]; onView: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
      <div className="grid grid-cols-[1fr_88px_70px] gap-0 border-b border-outline-variant px-3.5 py-2">
        {['Name', 'Type', 'Updated'].map(h => (
          <div
            key={h}
            className="text-[10px] font-medium uppercase tracking-wider text-on-surface-faint"
          >
            {h}
          </div>
        ))}
      </div>
      {rows.map((row, i) => {
        const config = TYPE_CONFIG[row.type];
        const Icon = config.icon;
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onView(row.id)}
            className={cn(
              'grid w-full grid-cols-[1fr_88px_70px] items-center gap-0 px-3.5 py-2 text-left',
              'transition-colors hover:bg-surface-container-highest',
              i < rows.length - 1 ? 'border-b border-outline-variant' : ''
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm"
                style={{
                  background: `color-mix(in srgb, ${config.color} 18%, transparent)`,
                  color: config.color,
                }}
              >
                <Icon className="h-3 w-3" />
              </span>
              <span className="truncate text-xs font-medium text-foreground">{row.title}</span>
            </div>
            <div>
              <span
                className="inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${config.color} 10%, transparent)`,
                  color: config.color,
                }}
              >
                {config.label.toLowerCase()}
              </span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-faint">
              {formatRelative(row.updatedAt)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

export function VaultHomePage() {
  const navigate = useNavigate();
  const dashboardQuery = useDashboardQuery();
  const { openView } = useAssetDrawer();

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

  const today = new Date().toLocaleDateString(undefined, DATE_OPTS);
  const data = dashboardQuery.data;
  const counts = data?.counts ?? { total: 0, byType: {}, pinnedCount: 0 };
  const pinnedAssets = (data?.pinnedAssets ?? []).slice(0, 6);
  const pinnedCollections = (data?.pinnedCollections ?? []).slice(0, 6);
  const recentAssets: RecentRow[] = (data?.recentAssets ?? []).slice(0, 8).map(a => ({
    id: a.id,
    type: a.type,
    title: a.title,
    pinned: a.pinned,
    language: a.language,
    updatedAt: new Date(a.updatedAt),
  }));

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Page header */}
      <div className="mb-6">
        <div className="mb-1 flex items-baseline gap-2.5">
          <h1 className="text-[22px] font-bold leading-none tracking-tight text-foreground">
            Dashboard
          </h1>
          <span className="font-mono text-xs text-on-surface-faint">vault.cellar</span>
        </div>
        <p className="text-xs text-on-surface-muted">{today}</p>
      </div>

      {/* Quick capture */}
      <div className="mb-7">
        <QuickCaptureRow />
      </div>

      {dashboardQuery.isLoading ? (
        <p className="text-xs text-on-surface-faint">Loading your vault…</p>
      ) : counts.total === 0 ? (
        <EmptyVault />
      ) : (
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Left column */}
          <div className="min-w-0">
            <VaultBreakdown total={counts.total} byType={counts.byType} />

            <section className="mb-7">
              <SectionHeader
                title="Pinned"
                count={pinnedAssets.length}
                action={pinnedAssets.length > 0 ? 'View all' : undefined}
                onAction={() => navigate('/vault/assets')}
              />
              {pinnedAssets.length === 0 ? (
                <p className="py-3 text-[11px] text-on-surface-faint">
                  No pinned assets yet — pin any asset to see it here.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2" data-testid="pinned-assets">
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

            <section>
              <SectionHeader
                title="Recently accessed"
                action={recentAssets.length > 0 ? 'View all' : undefined}
                onAction={() => navigate('/vault/assets')}
              />
              {recentAssets.length === 0 ? (
                <p className="py-3 text-[11px] text-on-surface-faint">No recent activity.</p>
              ) : (
                <div data-testid="recent-assets">
                  <RecentTable rows={recentAssets} onView={openView} />
                </div>
              )}
            </section>
          </div>

          {/* Right column */}
          <aside className="min-w-0">
            <section>
              <SectionHeader
                title="Pinned collections"
                count={pinnedCollections.length}
                action="Manage"
                onAction={() => navigate('/vault/collections')}
              />
              {pinnedCollections.length === 0 ? (
                <p className="py-3 text-[11px] text-on-surface-faint">No pinned collections yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5" data-testid="pinned-collections">
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
          </aside>
        </div>
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
