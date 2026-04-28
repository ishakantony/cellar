import { useCallback, useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import { Pencil, Pin, PinOff, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ConfirmDialog, Drawer, IconBadge, IconButton } from '@cellar/ui';
import type { IconBadgeProps } from '@cellar/ui';
import { AssetContentRenderer } from './asset-content-renderer';
import { useAssetQuery } from '@/hooks/queries/use-assets';
import {
  useDeleteAssetMutation,
  useTogglePinAssetMutation,
} from '@/hooks/mutations/use-asset-mutations';
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

  return (
    <Drawer open={isOpen} onClose={handleClose}>
      {assetId ? (
        <AssetViewContent id={assetId} onClose={handleClose} />
      ) : (
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-xs text-outline">Create form coming soon…</p>
          <IconButton
            icon={X}
            size="sm"
            onClick={handleClose}
            label="Close drawer"
            className="absolute top-4 right-4"
          />
        </div>
      )}
    </Drawer>
  );
}

function AssetViewContent({ id, onClose }: { id: string; onClose: () => void }) {
  const assetQuery = useAssetQuery(id);
  const togglePin = useTogglePinAssetMutation();
  const deleteAsset = useDeleteAssetMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  if (assetQuery.isPending) {
    return <div className="flex-1 p-6 text-center text-xs text-outline">Loading…</div>;
  }

  if (!assetQuery.data) {
    return <div className="flex-1 p-6 text-center text-xs text-outline">Asset not found.</div>;
  }

  const asset = assetQuery.data;
  const config = TYPE_CONFIG[asset.type];

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
          <Button variant="secondary" size="sm" onClick={() => {}}>
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
