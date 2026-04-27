import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import type { UpdateAssetInput } from '@cellar/shared';
import { AssetForm } from '@/components/assets/asset-form';
import { Button, Modal } from '@cellar/ui';
import { useAssetQuery } from '@/hooks/queries/use-assets';
import { useCollectionsQuery } from '@/hooks/queries/use-collections';
import { useUpdateAssetMutation } from '@/hooks/mutations/use-asset-mutations';
import {
  useAddAssetToCollectionMutation,
  useRemoveAssetFromCollectionMutation,
} from '@/hooks/mutations/use-collection-mutations';

export function AssetEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assetQuery = useAssetQuery(id);
  const collectionsQuery = useCollectionsQuery();
  const updateAsset = useUpdateAssetMutation(id ?? '');
  const addToCollection = useAddAssetToCollectionMutation();
  const removeFromCollection = useRemoveAssetFromCollectionMutation();

  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = useCallback(
    async (data: UpdateAssetInput & { collectionIds?: string[] }) => {
      if (!assetQuery.data || !id) return;
      const asset = assetQuery.data;
      const { collectionIds, ...assetData } = data;
      await updateAsset.mutateAsync(assetData);

      const currentIds = asset.collections.map(c => c.collection.id);
      const newIds = collectionIds || [];
      const added = newIds.filter(cid => !currentIds.includes(cid));
      const removed = currentIds.filter(cid => !newIds.includes(cid));
      if (added.length || removed.length) {
        await Promise.all([
          ...added.map(collectionId => addToCollection.mutateAsync({ collectionId, assetId: id })),
          ...removed.map(collectionId =>
            removeFromCollection.mutateAsync({ collectionId, assetId: id })
          ),
        ]);
      }

      toast.success('Asset updated');
      navigate(`/assets/${id}`);
    },
    [assetQuery.data, id, updateAsset, addToCollection, removeFromCollection, navigate]
  );

  if (assetQuery.isPending) {
    return <div className="py-16 text-center text-xs text-outline">Loading…</div>;
  }
  if (!assetQuery.data || !id) {
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
  const availableCollections = collectionsQuery.data?.map(c => ({ id: c.id, name: c.name })) ?? [];

  const defaultValues: Partial<UpdateAssetInput & { collectionIds: string[] }> = {
    title: asset.title,
    description: asset.description || undefined,
    content: asset.content || undefined,
    language: asset.language || undefined,
    url: asset.url || undefined,
    filePath: asset.filePath || undefined,
    fileName: asset.fileName || undefined,
    mimeType: asset.mimeType || undefined,
    fileSize: asset.fileSize ?? undefined,
    collectionIds: asset.collections.map(c => c.collection.id),
  };

  const handleCancel = () => {
    if (isDirty) {
      setPendingNavigation(`/assets/${id}`);
      setShowLeaveModal(true);
    } else {
      navigate(`/assets/${id}`);
    }
  };

  const handleLeave = () => {
    setShowLeaveModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Edit Asset</h1>
        <p className="text-xs text-outline mt-1">Make changes to your asset</p>
      </div>

      <AssetForm
        mode="edit"
        defaultValues={defaultValues}
        availableCollections={availableCollections}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDirtyChange={setIsDirty}
      />

      <Modal
        open={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Unsaved Changes"
        size="sm"
        actions={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowLeaveModal(false)}>
              Stay
            </Button>
            <Button variant="danger" onClick={handleLeave}>
              Leave
            </Button>
          </div>
        }
      >
        <p className="text-sm text-on-surface-variant">
          You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
        </p>
      </Modal>
    </div>
  );
}
