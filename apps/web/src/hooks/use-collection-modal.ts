import { create } from 'zustand';

export interface CollectionModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | null;
  collectionId: string | null;
}

export interface CollectionModalActions {
  openCreate: () => void;
  openEdit: (id: string) => void;
  close: () => void;
}

const initialState: CollectionModalState = {
  isOpen: false,
  mode: null,
  collectionId: null,
};

export const useCollectionModal = create<CollectionModalState & CollectionModalActions>()(set => ({
  ...initialState,

  openCreate: () =>
    set({
      isOpen: true,
      mode: 'create',
      collectionId: null,
    }),

  openEdit: (id: string) =>
    set({
      isOpen: true,
      mode: 'edit',
      collectionId: id,
    }),

  close: () => set(initialState),
}));
