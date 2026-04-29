import { toast } from 'sonner';
import { Modal } from '@cellar/ui';
import { CollectionForm } from './collection-form';
import { useCollectionModal } from '../../hooks/use-collection-modal';
import { useCollectionQuery } from '../../hooks/queries/use-collections';
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
} from '../../hooks/mutations/use-collection-mutations';
import type { CreateCollectionInput } from '@cellar/shared';

function CollectionModalInner({ collectionId }: { collectionId: string }) {
  const { close } = useCollectionModal();
  const collectionQuery = useCollectionQuery(collectionId);
  const updateCollection = useUpdateCollectionMutation(collectionId);

  const collection = collectionQuery.data;

  const handleEdit = async (data: CreateCollectionInput) => {
    try {
      await updateCollection.mutateAsync(data);
      toast.success('Collection updated');
      close();
    } catch {
      toast.error('Failed to update collection');
      throw new Error('Failed to update collection');
    }
  };

  if (collectionQuery.isPending) {
    return (
      <div className="py-8 text-center">
        <p className="text-xs text-outline">Loading...</p>
      </div>
    );
  }

  return (
    <CollectionForm
      onSubmit={handleEdit}
      defaultValues={
        collection
          ? {
              name: collection.name,
              description: collection.description || '',
              color: collection.color || '#3b82f6',
            }
          : undefined
      }
      submitLabel="Save"
      mode="edit"
      onCancel={close}
    />
  );
}

function CollectionCreateInner() {
  const { close } = useCollectionModal();
  const createCollection = useCreateCollectionMutation();

  const handleCreate = async (data: CreateCollectionInput) => {
    try {
      await createCollection.mutateAsync(data);
      toast.success(`Collection "${data.name}" created`);
      close();
    } catch {
      toast.error('Failed to create collection');
      throw new Error('Failed to create collection');
    }
  };

  return (
    <CollectionForm onSubmit={handleCreate} submitLabel="Create" mode="create" onCancel={close} />
  );
}

export function CollectionModal() {
  const { isOpen, mode, collectionId, close } = useCollectionModal();

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title={mode === 'edit' ? 'Edit Collection' : 'New Collection'}
      size="md"
    >
      {mode === 'edit' && collectionId ? (
        <CollectionModalInner collectionId={collectionId} />
      ) : (
        <CollectionCreateInner />
      )}
    </Modal>
  );
}
