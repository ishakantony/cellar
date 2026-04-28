import { useCallback, useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import { Pencil, Pin, PinOff, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ConfirmDialog, Drawer, IconBadge, IconButton } from '@cellar/ui';
import type { IconBadgeProps } from '@cellar/ui';
import type { CreateAssetInput } from '@cellar/shared';
import { AssetContentRenderer } from './asset-content-renderer';
import { AssetForm } from './asset-form';
import { useAssetQuery } from '@/hooks/queries/use-assets';
import {
  useCreateAssetMutation,
  useDeleteAssetMutation,
  useTogglePinAssetMutation,
  useUpdateAssetMutation,
} from '@/hooks/mutations/use-asset-mutations';
import { useCollectionsQuery } from '@/hooks/queries/use-collections';
import { TYPE_CONFIG } from '@/lib/asset-types';

export function AssetDrawer() {
  const [assetId, setAssetId] = useQueryState('id');
  const [newParam, setNewParam] = useQueryState('new');

  const isOpen = !!(assetId || newParam);

  const handleClose = useCallback(() => {
    void setAssetId(null);
    void setNewParam(null);
  }, [setAssetId, setNewParam]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  const handleCreated = useCallback(
    (id: string) => {
      void setNewParam(null);
      void setAssetId(id);
    },
    [setNewParam, setAssetId]
  );

  return (
    <Drawer open={isOpen} onClose={handleClose}>
      {assetId ? (
        <AssetViewContent id={assetId} onClose={handleClose} />
      ) : newParam ? (
        <AssetCreateContent onClose={handleClose} onCreated={handleCreated} />
      ) : null}
    </Drawer>
  );
}

function AssetCreateContent({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const createAsset = useCreateAssetMutation();
  const collectionsQuery = useCollectionsQuery();
  const availableCollections = collectionsQuery.data?.map(c => ({ id: c.id, name: c.name })) ?? [];

  const handleSubmit = useCallback(
    async (data: CreateAssetInput & { collectionIds?: string[] }) => {
      const created = await createAsset.mutateAsync(data);
      toast.success(`Asset "${created.title}" created`);
      onCreated(created.id);
    },
    [createAsset, onCreated]
  );

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
        <h2 className="text-base font-bold text-slate-100">New Asset</h2>
        <IconButton icon={X} size="sm" onClick={onClose} label="Close drawer" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AssetForm
          mode="create"
          availableCollections={availableCollections}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </>
  );
}

function AssetViewContent({ id, onClose }: { id: string; onClose: () => void }) {
  const assetQuery = useAssetQuery(id);
  const togglePin = useTogglePinAssetMutation();
  const deleteAsset = useDeleteAssetMutation();
  const updateAsset = useUpdateAssetMutation(id);
  const collectionsQuery = useCollectionsQuery();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isDirty, setIsDirty] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const handleTogglePin = useCallback(async () => {
    try {
      await togglePin.mutateAsync(id);
    } catch {
      toast.error('Failed to toggle pin');
    }
  }, [id, togglePin]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteAsset.mutateAsync(id);
      toast.success('Asset deleted');
      onClose();
    } catch {
      toast.error('Failed to delete asset');
      setDeleteDialogOpen(false);
    }
  }, [id, deleteAsset, onClose]);

  const handleEditSave = useCallback(
    async (data: Parameters<typeof updateAsset.mutateAsync>[0]) => {
      await updateAsset.mutateAsync(data);
      toast.success('Asset updated');
      setMode('view');
      setIsDirty(false);
    },
    [updateAsset]
  );

  const handleEditCancel = useCallback(() => {
    if (isDirty) {
      setDiscardDialogOpen(true);
    } else {
      setMode('view');
    }
  }, [isDirty]);

  if (assetQuery.isPending) {
    return <div className="flex-1 p-6 text-center text-xs text-outline">Loading…</div>;
  }

  if (!assetQuery.data) {
    return <div className="flex-1 p-6 text-center text-xs text-outline">Asset not found.</div>;
  }

  const asset = assetQuery.data;
  const config = TYPE_CONFIG[asset.type];
  const availableCollections = collectionsQuery.data?.map(c => ({ id: c.id, name: c.name })) ?? [];

  const editDefaultValues = {
    type: asset.type,
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

  if (mode === 'edit') {
    return (
      <>
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
          <h2 className="text-base font-bold text-slate-100">Edit Asset</h2>
          <IconButton icon={X} size="sm" onClick={onClose} label="Close drawer" />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AssetForm
            mode="edit"
            defaultValues={editDefaultValues}
            availableCollections={availableCollections}
            onSubmit={handleEditSave}
            onCancel={handleEditCancel}
            onDirtyChange={setIsDirty}
          />
        </div>

        <ConfirmDialog
          open={discardDialogOpen}
          onClose={() => setDiscardDialogOpen(false)}
          onConfirm={() => {
            setDiscardDialogOpen(false);
            setMode('view');
          }}
          title="Discard Changes"
          message="Discard unsaved changes?"
          confirmLabel="Discard"
          cancelLabel="Stay"
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-start gap-3 px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
        <IconBadge
          icon={config.icon}
          variant={asset.type.toLowerCase() as IconBadgeProps['variant']}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-slate-100 leading-tight">{asset.title}</h2>
          {asset.description && (
            <p className="text-xs text-outline mt-0.5 line-clamp-2">{asset.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            icon={asset.pinned ? PinOff : Pin}
            size="sm"
            onClick={handleTogglePin}
            label={asset.pinned ? 'Unpin' : 'Pin'}
            className={asset.pinned ? 'text-primary' : ''}
          />
          <Button variant="secondary" size="sm" onClick={() => setMode('edit')}>
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
          <IconButton icon={X} size="sm" onClick={onClose} label="Close drawer" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AssetContentRenderer asset={asset} />

        {asset.collections.length > 0 && (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Collections
            </h3>
            <div className="flex flex-wrap gap-2">
              {asset.collections.map(({ collection }) => (
                <span
                  key={collection.id}
                  className="inline-flex items-center rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant"
                >
                  {collection.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-white/5 shrink-0 flex items-center gap-4 text-[10px] text-outline">
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
    </>
  );
}
