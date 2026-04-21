'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Folder, ArrowLeft } from 'lucide-react';
import { getCollection, updateCollection, deleteCollection } from '@/app/actions/collections';
import { CollectionModal } from '@/components/collection-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { IconBadge } from '@/components/ui/icon-badge';
import { Button } from '@/components/ui/button';
import { getColorClasses } from '@/lib/colors';
import type { CreateCollectionInput } from '@/lib/validation';

interface AssetItem {
  asset: {
    id: string;
    title: string;
    type: string;
  };
}

interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  pinned: boolean;
  _count: { assets: number };
  assets: AssetItem[];
}

export function CollectionDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollection(id);
      setCollection(data as CollectionDetail | null);
    } catch {
      toast.error('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleEdit = useCallback(
    async (data: CreateCollectionInput) => {
      try {
        await updateCollection(id, data);
        toast.success('Collection updated');
        setEditModalOpen(false);
        await fetchCollection();
      } catch {
        toast.error('Failed to update collection');
        throw new Error('Failed to update collection');
      }
    },
    [id, fetchCollection]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deleteCollection(id);
      toast.success('Collection deleted');
      setDeleteDialogOpen(false);
      router.push('/collections');
    } catch {
      toast.error('Failed to delete collection');
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="text-xs text-outline">Loading collection...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="py-16 text-center">
        <p className="text-xs text-outline">Collection not found.</p>
        <Button variant="secondary" onClick={() => router.push('/collections')} className="mt-4">
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
        onClick={() => router.push('/collections')}
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
            <p className="text-[10px] text-outline mt-1">{collection._count.assets} items</p>
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
            <div
              key={asset.id}
              className="flex items-center gap-3 bg-surface-container rounded-lg px-4 py-3"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline bg-surface-bright px-2 py-0.5 rounded">
                {asset.type}
              </span>
              <span className="text-sm text-slate-100">{asset.title}</span>
            </div>
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
