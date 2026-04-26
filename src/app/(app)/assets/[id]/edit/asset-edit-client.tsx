'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateAsset } from '@/app/actions/assets';
import { addAssetToCollection, removeAssetFromCollection } from '@/app/actions/collections';
import { AssetForm } from '@/components/assets/asset-form';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { UpdateAssetInput } from '@/lib/validation';
import { AssetType } from '@/generated/prisma/enums';

export interface AssetEditClientProps {
  asset: {
    id: string;
    type: AssetType;
    title: string;
    description: string | null;
    content: string | null;
    language: string | null;
    url: string | null;
    filePath: string | null;
    fileName: string | null;
    mimeType: string | null;
    fileSize: number | null;
    collections: {
      collection: {
        id: string;
        name: string;
      };
    }[];
  };
  availableCollections: { id: string; name: string }[];
}

export function AssetEditClient({ asset, availableCollections }: AssetEditClientProps) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // beforeunload handler
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
      const { collectionIds, ...assetData } = data;

      await updateAsset(asset.id, assetData);

      // Sync collections
      const currentIds = asset.collections.map(c => c.collection.id);
      const newIds = collectionIds || [];
      const added = newIds.filter(id => !currentIds.includes(id));
      const removed = currentIds.filter(id => !newIds.includes(id));

      if (added.length > 0 || removed.length > 0) {
        await Promise.all([
          ...added.map(id => addAssetToCollection(asset.id, id)),
          ...removed.map(id => removeAssetFromCollection(asset.id, id)),
        ]);
      }

      toast.success('Asset updated');
      router.push(`/assets/${asset.id}`);
    },
    [asset.id, asset.collections, router]
  );

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setPendingNavigation(`/assets/${asset.id}`);
      setShowLeaveModal(true);
    } else {
      router.push(`/assets/${asset.id}`);
    }
  }, [isDirty, asset.id, router]);

  const handleLeave = useCallback(() => {
    setShowLeaveModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  const defaultValues: Partial<UpdateAssetInput & { collectionIds: string[] }> = {
    title: asset.title,
    description: asset.description || undefined,
    content: asset.content || undefined,
    language: asset.language || undefined,
    url: asset.url || undefined,
    filePath: asset.filePath || undefined,
    fileName: asset.fileName || undefined,
    mimeType: asset.mimeType || undefined,
    fileSize: asset.fileSize || undefined,
    collectionIds: asset.collections.map(c => c.collection.id),
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
