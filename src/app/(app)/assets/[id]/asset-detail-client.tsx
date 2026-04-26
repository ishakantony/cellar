'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Trash2, Pin, PinOff } from 'lucide-react';
import { AssetType } from '@/generated/prisma/enums';
import { TYPE_CONFIG } from '@/lib/asset-types';
import { togglePin, deleteAsset } from '@/app/actions/assets';
import { addAssetToCollection, removeAssetFromCollection } from '@/app/actions/collections';
import { AssetContentRenderer } from '@/components/assets/asset-content-renderer';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconBadge } from '@/components/ui/icon-badge';
import { IconBadgeProps } from '@/components/ui/icon-badge';

interface AssetDetailClientProps {
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
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
    collections: {
      collection: {
        id: string;
        name: string;
      };
    }[];
  };
  availableCollections: { id: string; name: string }[];
}

export function AssetDetailClient({ asset, availableCollections }: AssetDetailClientProps) {
  const router = useRouter();
  const [pinned, setPinned] = useState(asset.pinned);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    asset.collections.map(c => c.collection.id)
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [, setIsDeleting] = useState(false);

  const config = TYPE_CONFIG[asset.type];

  const handleTogglePin = useCallback(async () => {
    setPinned(p => !p);
    try {
      await togglePin(asset.id);
    } catch {
      setPinned(p => !p);
      toast.error('Failed to toggle pin');
    }
  }, [asset.id]);

  const handleCollectionsChange = useCallback(
    async (newIds: string[]) => {
      const added = newIds.filter(id => !selectedCollections.includes(id));
      const removed = selectedCollections.filter(id => !newIds.includes(id));

      // Optimistic update
      setSelectedCollections(newIds);

      try {
        await Promise.all([
          ...added.map(id => addAssetToCollection(asset.id, id)),
          ...removed.map(id => removeAssetFromCollection(asset.id, id)),
        ]);
      } catch {
        // Rollback
        setSelectedCollections(selectedCollections);
        toast.error('Failed to update collections');
      }
    },
    [asset.id, selectedCollections]
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteAsset(asset.id);
      toast.success('Asset deleted');
      router.push('/assets');
    } catch {
      toast.error('Failed to delete asset');
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [asset.id, router]);

  const collectionOptions = availableCollections.map(c => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push('/assets')}
        className="inline-flex items-center gap-1.5 text-xs text-outline hover:text-on-surface-variant transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to assets
      </button>

      {/* Header */}
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
            icon={pinned ? PinOff : Pin}
            size="sm"
            onClick={handleTogglePin}
            label={pinned ? 'Unpin' : 'Pin'}
            className={pinned ? 'text-primary' : ''}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/assets/${asset.id}/edit`)}
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

      {/* Content */}
      <AssetContentRenderer asset={asset} />

      {/* Collections */}
      {availableCollections.length > 0 && (
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

      {/* Metadata */}
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
