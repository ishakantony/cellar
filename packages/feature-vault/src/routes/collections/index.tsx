import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { CollectionsToolbar } from '../../components/collections/collections-toolbar';
import { CollectionsView } from '../../components/collections/collections-view';
import { ConfirmDialog, TextLink } from '@cellar/ui';
import { useCollectionsQuery } from '../../hooks/queries/use-collections';
import {
  useDeleteCollectionMutation,
  useToggleCollectionPinMutation,
} from '../../hooks/mutations/use-collection-mutations';
import { useViewMode } from '../../hooks/use-view-mode';
import { useCollectionModal } from '../../hooks/use-collection-modal';

export function CollectionsListPage() {
  const navigate = useNavigate();
  const collectionsQuery = useCollectionsQuery();
  const deleteCollection = useDeleteCollectionMutation();
  const togglePin = useToggleCollectionPinMutation();
  const { openCreate, openEdit } = useCollectionModal();

  const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''));
  const [viewMode, setViewMode] = useViewMode();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  const collections = collectionsQuery.data ?? [];

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const query = searchQuery.toLowerCase();
    return collections.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );
  }, [collections, searchQuery]);

  const viewCollections = filteredCollections.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    color: c.color,
    pinned: c.pinned,
    _count: { assets: c.assetCount },
  }));

  const handleTogglePin = useCallback(
    async (id: string) => {
      try {
        await togglePin.mutateAsync(id);
      } catch {
        toast.error('Failed to toggle pin');
      }
    },
    [togglePin]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!collectionToDelete) return;
    try {
      await deleteCollection.mutateAsync(collectionToDelete);
      toast.success('Collection deleted');
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    } catch {
      toast.error('Failed to delete collection');
    }
  }, [collectionToDelete, deleteCollection]);

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
        onNewCollection={openCreate}
      />

      {collectionsQuery.isPending ? (
        <div className="py-16 text-center">
          <p className="text-xs text-outline">Loading collections...</p>
        </div>
      ) : (
        <CollectionsView
          collections={viewCollections}
          view={viewMode}
          onCardClick={id => navigate(`/vault/collections/${id}`)}
          onTogglePin={handleTogglePin}
          onEdit={id => openEdit(id)}
          onDelete={id => {
            setCollectionToDelete(id);
            setDeleteDialogOpen(true);
          }}
          emptyMessage={
            searchQuery.trim() ? (
              'No collections match your search.'
            ) : (
              <>
                No collections yet. <TextLink onClick={openCreate}>Create</TextLink> your first
                collection to get started.
              </>
            )
          }
        />
      )}

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
