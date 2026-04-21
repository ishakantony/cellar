'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createCollection,
  getCollections,
  toggleCollectionPin,
  deleteCollection,
} from '@/app/actions/collections';
import { CollectionsToolbar } from '@/components/collections/collections-toolbar';
import { CollectionsView } from '@/components/collections/collections-view';
import { CollectionModal } from '@/components/collection-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { CreateCollectionInput } from '@/lib/validation';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  pinned: boolean;
  _count: { assets: number };
}

export function CollectionsClient() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      setCollections(data as Collection[]);
    } catch {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const query = searchQuery.toLowerCase();
    return collections.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );
  }, [collections, searchQuery]);

  const handleCreate = useCallback(
    async (data: CreateCollectionInput) => {
      try {
        await createCollection(data);
        toast.success(`Collection "${data.name}" created`);
        setModalOpen(false);
        await fetchCollections();
      } catch {
        toast.error('Failed to create collection');
        throw new Error('Failed to create collection');
      }
    },
    [fetchCollections]
  );

  const handleTogglePin = useCallback(
    async (id: string) => {
      try {
        await toggleCollectionPin(id);
        await fetchCollections();
      } catch {
        toast.error('Failed to toggle pin');
      }
    },
    [fetchCollections]
  );

  const handleDeleteClick = useCallback((id: string) => {
    setCollectionToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!collectionToDelete) return;
    try {
      await deleteCollection(collectionToDelete);
      toast.success('Collection deleted');
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
      await fetchCollections();
    } catch {
      toast.error('Failed to delete collection');
    }
  }, [collectionToDelete, fetchCollections]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/collections/${id}`);
    },
    [router]
  );

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/collections/${id}`);
    },
    [router]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-100">Collections</h1>
        <p className="text-xs text-outline mt-1">Organize your assets into collections</p>
      </div>

      <CollectionsToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        view={viewMode}
        onViewChange={setViewMode}
        onNewCollection={() => setModalOpen(true)}
      />

      {loading ? (
        <div className="py-16 text-center">
          <p className="text-xs text-outline">Loading collections...</p>
        </div>
      ) : (
        <CollectionsView
          collections={filteredCollections}
          view={viewMode}
          onCardClick={handleCardClick}
          onTogglePin={handleTogglePin}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage={
            searchQuery.trim()
              ? 'No collections match your search.'
              : 'No collections yet. Create your first collection to get started.'
          }
          emptyAction={
            !searchQuery.trim()
              ? { label: 'New Collection', onClick: () => setModalOpen(true) }
              : undefined
          }
        />
      )}

      <CollectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCollectionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Collection"
        message="Are you sure you want to delete this collection? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
