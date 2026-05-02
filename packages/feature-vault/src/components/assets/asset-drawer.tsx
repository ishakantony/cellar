import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Pencil, Pin, PinOff, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog, Drawer, IconBadge, IconButton, Tooltip } from '@cellar/ui';
import type { IconBadgeProps } from '@cellar/ui';
import type { CreateAssetInput } from '@cellar/shared';
import { AssetContentRenderer } from './asset-content-renderer';
import { AssetForm } from './asset-form';
import { useAssetQuery } from '../../hooks/queries/use-assets';
import {
  useCreateAssetMutation,
  useDeleteAssetMutation,
  useTogglePinAssetMutation,
  useUpdateAssetMutation,
} from '../../hooks/mutations/use-asset-mutations';
import { useCollectionsQuery } from '../../hooks/queries/use-collections';
import { TYPE_CONFIG } from '../../lib/asset-types';
import { formatRelativeTime, formatExactTime } from '../../lib/date';
import { useAssetDrawer } from '../../hooks/use-asset-drawer';

export function AssetDrawer() {
  const { isOpen, mode, assetId, initialType, initialCollectionId, close, openView } =
    useAssetDrawer();

  const handleClose = useCallback(() => {
    close();
  }, [close]);

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
      openView(id);
    },
    [openView]
  );

  return (
    <Drawer open={isOpen} onClose={handleClose}>
      {mode === 'view' && assetId ? (
        <AssetViewContent id={assetId} onClose={handleClose} startInEditMode={false} />
      ) : mode === 'edit' && assetId ? (
        <AssetViewContent id={assetId} onClose={handleClose} startInEditMode={true} />
      ) : mode === 'create' ? (
        <AssetCreateContent
          onClose={handleClose}
          onCreated={handleCreated}
          initialType={initialType ?? undefined}
          initialCollectionId={initialCollectionId ?? undefined}
        />
      ) : null}
    </Drawer>
  );
}

function AssetCreateContent({
  onClose,
  onCreated,
  initialType,
  initialCollectionId,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
  initialType?: string;
  initialCollectionId?: string;
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

  const defaultValues: Partial<CreateAssetInput & { collectionIds?: string[] }> = {};
  if (initialType) {
    defaultValues.type = initialType as CreateAssetInput['type'];
  }
  if (initialCollectionId) {
    defaultValues.collectionIds = [initialCollectionId];
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-outline-variant shrink-0">
        <h2 className="text-base font-bold text-foreground">New Asset</h2>
        <IconButton icon={X} size="sm" onClick={onClose} label="Close drawer" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <AssetForm
          mode="create"
          defaultValues={Object.keys(defaultValues).length > 0 ? defaultValues : undefined}
          availableCollections={availableCollections}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </>
  );
}

function AssetViewContent({
  id,
  onClose,
  startInEditMode,
}: {
  id: string;
  onClose: () => void;
  startInEditMode: boolean;
}) {
  const assetQuery = useAssetQuery(id);
  const togglePin = useTogglePinAssetMutation();
  const deleteAsset = useDeleteAssetMutation();
  const updateAsset = useUpdateAssetMutation(id);
  const collectionsQuery = useCollectionsQuery();
  const [mode, setMode] = useState<'view' | 'edit'>(startInEditMode ? 'edit' : 'view');
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
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-outline-variant shrink-0">
          <h2 className="text-base font-bold text-foreground">Edit Asset</h2>
          <IconButton icon={X} size="sm" onClick={onClose} label="Close drawer" />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
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
      <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-outline-variant shrink-0">
        <IconBadge
          icon={config.icon}
          variant={asset.type.toLowerCase() as IconBadgeProps['variant']}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground leading-tight">{asset.title}</h2>
          {asset.description && (
            <p className="text-xs text-on-surface-faint mt-0.5 line-clamp-2">{asset.description}</p>
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
          <IconButton icon={Pencil} size="sm" onClick={() => setMode('edit')} label="Edit" />
          <IconButton
            icon={Trash2}
            size="sm"
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
                <Link
                  key={collection.id}
                  to={`/vault/collections/${collection.id}`}
                  className="inline-flex items-center rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container-high hover:text-foreground transition-colors"
                >
                  {collection.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-outline-variant shrink-0 flex items-center gap-4 text-[10px] text-on-surface-faint">
        <Tooltip content={formatExactTime(asset.createdAt)}>
          <span>Created {formatRelativeTime(asset.createdAt)}</span>
        </Tooltip>
        <Tooltip content={formatExactTime(asset.updatedAt)}>
          <span>Updated {formatRelativeTime(asset.updatedAt)}</span>
        </Tooltip>
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
