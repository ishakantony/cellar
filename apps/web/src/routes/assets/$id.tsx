import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Trash2, Pin, PinOff } from 'lucide-react';
import { TYPE_CONFIG } from '@/lib/asset-types';
import { AssetContentRenderer } from '@/components/assets/asset-content-renderer';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconBadge, type IconBadgeProps } from '@/components/ui/icon-badge';
import { useAssetQuery } from '@/hooks/queries/use-assets';
import { useCollectionsQuery } from '@/hooks/queries/use-collections';
import {
  useDeleteAssetMutation,
  useTogglePinAssetMutation,
} from '@/hooks/mutations/use-asset-mutations';
import {
  useAddAssetToCollectionMutation,
  useRemoveAssetFromCollectionMutation,
} from '@/hooks/mutations/use-collection-mutations';

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assetQuery = useAssetQuery(id);
  const collectionsQuery = useCollectionsQuery();
  const togglePin = useTogglePinAssetMutation();
  const deleteAsset = useDeleteAssetMutation();
  const addToCollection = useAddAssetToCollectionMutation();
  const removeFromCollection = useRemoveAssetFromCollectionMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleTogglePin = useCallback(async () => {
    if (!id) return;
    try {
      await togglePin.mutateAsync(id);
    } catch {
      toast.error('Failed to toggle pin');
    }
  }, [id, togglePin]);

  const handleCollectionsChange = useCallback(
    async (newIds: string[]) => {
      if (!assetQuery.data) return;
      const asset = assetQuery.data;
      const currentIds = asset.collections.map(c => c.collection.id);
      const added = newIds.filter(cid => !currentIds.includes(cid));
      const removed = currentIds.filter(cid => !newIds.includes(cid));
      try {
        await Promise.all([
          ...added.map(collectionId =>
            addToCollection.mutateAsync({ collectionId, assetId: asset.id })
          ),
          ...removed.map(collectionId =>
            removeFromCollection.mutateAsync({ collectionId, assetId: asset.id })
          ),
        ]);
      } catch {
        toast.error('Failed to update collections');
      }
    },
    [assetQuery.data, addToCollection, removeFromCollection]
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    try {
      await deleteAsset.mutateAsync(id);
      toast.success('Asset deleted');
      navigate('/assets');
    } catch {
      toast.error('Failed to delete asset');
      setDeleteDialogOpen(false);
    }
  }, [id, deleteAsset, navigate]);

  if (assetQuery.isPending) {
    return <div className="py-16 text-center text-xs text-outline">Loading…</div>;
  }
  if (!assetQuery.data) {
    return (
      <div className="py-16 text-center">
        <p className="text-xs text-outline">Asset not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/assets')}>
          Back to Assets
        </Button>
      </div>
    );
  }

  const asset = assetQuery.data;
  const config = TYPE_CONFIG[asset.type];
  const selectedCollections = asset.collections.map(c => c.collection.id);
  const collectionOptions = collectionsQuery.data?.map(c => ({ value: c.id, label: c.name })) ?? [];

  return (
    <div>
      <button
        onClick={() => navigate('/assets')}
        className="inline-flex items-center gap-1.5 text-xs text-outline hover:text-on-surface-variant transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to assets
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <IconBadge
            icon={config.icon}
            variant={asset.type.toLowerCase() as IconBadgeProps['variant']}
            size="md"
          />
          <div>
            <h1 className="text-lg font-bold text-slate-100">{asset.title}</h1>
            {asset.description && (
              <p className="text-xs text-outline mt-0.5">{asset.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={asset.pinned ? PinOff : Pin}
            size="sm"
            onClick={handleTogglePin}
            label={asset.pinned ? 'Unpin' : 'Pin'}
            className={asset.pinned ? 'text-primary' : ''}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/assets/${asset.id}/edit`)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <IconButton
            icon={Trash2}
            size="sm"
            variant="ghost"
            onClick={() => setDeleteDialogOpen(true)}
            label="Delete"
            className="text-error hover:text-error"
          />
        </div>
      </div>

      <AssetContentRenderer asset={asset} />

      {collectionOptions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Collections
          </h3>
          <MultiSelect
            options={collectionOptions}
            selected={selectedCollections}
            onChange={handleCollectionsChange}
            placeholder="Add to collections..."
          />
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-outline-variant/10 flex items-center gap-4 text-[10px] text-outline">
        <span>Created {new Date(asset.createdAt).toLocaleDateString()}</span>
        <span>Updated {new Date(asset.updatedAt).toLocaleDateString()}</span>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
