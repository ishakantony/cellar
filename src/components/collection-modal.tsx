'use client';

import { Modal } from '@/components/ui/modal';
import { CollectionForm } from '@/components/collection-form';
import type { CreateCollectionInput } from '@/lib/validation';

export function CollectionModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  initialData?: Partial<CreateCollectionInput>;
}) {
  const mode = initialData ? 'edit' : 'create';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Collection' : 'New Collection'}
      size="md"
    >
      <CollectionForm
        onSubmit={async data => {
          await onSubmit(data);
          onClose();
        }}
        defaultValues={initialData}
        submitLabel={mode === 'edit' ? 'Save' : 'Create'}
        mode={mode}
        onCancel={onClose}
      />
    </Modal>
  );
}
