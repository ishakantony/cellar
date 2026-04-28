import { create } from 'zustand';

export interface AssetDrawerState {
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create' | null;
  assetId: string | null;
  initialType: string | null;
  initialCollectionId: string | null;
}

export interface AssetDrawerActions {
  openView: (id: string) => void;
  openEdit: (id: string) => void;
  openCreate: (opts?: { type?: string; collectionId?: string }) => void;
  close: () => void;
}

const initialState: AssetDrawerState = {
  isOpen: false,
  mode: null,
  assetId: null,
  initialType: null,
  initialCollectionId: null,
};

export const useAssetDrawer = create<AssetDrawerState & AssetDrawerActions>()(set => ({
  ...initialState,

  openView: (id: string) =>
    set({
      isOpen: true,
      mode: 'view',
      assetId: id,
      initialType: null,
      initialCollectionId: null,
    }),

  openEdit: (id: string) =>
    set({
      isOpen: true,
      mode: 'edit',
      assetId: id,
      initialType: null,
      initialCollectionId: null,
    }),

  openCreate: (opts?: { type?: string; collectionId?: string }) =>
    set({
      isOpen: true,
      mode: 'create',
      assetId: null,
      initialType: opts?.type ?? null,
      initialCollectionId: opts?.collectionId ?? null,
    }),

  close: () => set(initialState),
}));
