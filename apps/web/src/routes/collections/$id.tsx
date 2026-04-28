import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Folder, ArrowLeft } from 'lucide-react';
import type { CreateCollectionInput } from '@cellar/shared';
import { CollectionModal } from '@/components/collections/collection-modal';
import { AssetCard } from '@/components/assets/asset-card';
import { Button, ConfirmDialog, IconBadge } from '@cellar/ui';
import { getColorClasses } from '@/lib/colors';
import { useCollectionQuery } from '@/hooks/queries/use-collections';
import {
  useDeleteCollectionMutation,
  useUpdateCollectionMutation,
} from '@/hooks/mutations/use-collection-mutations';
import {
  useDeleteAssetMutation,
  useTogglePinAssetMutation,
} from '@/hooks/mutations/use-asset-mutations';

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const collectionQuery = useCollectionQuery(id);
  const updateCollection = useUpdateCollectionMutation(id ?? '');
  const deleteCollection = useDeleteCollectionMutation();
  const togglePin = useTogglePinAssetMutation();
  const deleteAsset = useDeleteAssetMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = useCallback(
    async (data: CreateCollectionInput) => {
      try {
        await updateCollection.mutateAsync(data);
        toast.success('Collection updated');
        setEditModalOpen(false);
      } catch {
        toast.error('Failed to update collection');
        throw new Error('Failed to update collection');
      }
    },
    [updateCollection]
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    try {
      await deleteCollection.mutateAsync(id);
      toast.success('Collection deleted');
      setDeleteDialogOpen(false);
      navigate('/collections');
    } catch {
      toast.error('Failed to delete collection');
    }
  }, [id, deleteCollection, navigate]);

  if (collectionQuery.isPending) {
    return (
      <div className="py-16 text-center">
        <p className="text-xs text-outline">Loading collection...</p>
      </div>
    );
  }
  const collection = collectionQuery.data;
  if (!collection) {
    return (
      <div className="py-16 text-center">
        <p className="text-xs text-outline">Collection not found.</p>
        <Button variant="secondary" onClick={() => navigate('/collections')} className="mt-4">
          Back to Collections
        </Button>
      </div>
    );
  }

  const colorClasses = getColorClasses(collection.color);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/collections')}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <IconBadge icon={Folder} variant="collection" color={colorClasses} size="lg" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">{collection.name}</h1>
            {collection.description && (
              <p className="text-xs text-outline mt-1">{collection.description}</p>
            )}
            <p className="text-[10px] text-outline mt-1">{collection.assetCount} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditModalOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {collection.assets.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-xs text-outline">No assets in this collection yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {collection.assets.map(({ asset }) => (
            <AssetCard
              key={asset.id}
              asset={{
                ...asset,
                updatedAt: new Date(asset.updatedAt),
              }}
              onTogglePin={() => togglePin.mutate(asset.id)}
              onDelete={() => deleteAsset.mutate(asset.id)}
              compact
            />
          ))}
        </div>
      )}

      <CollectionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEdit}
        initialData={{
          name: collection.name,
          description: collection.description || '',
          color: collection.color || '#3b82f6',
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
