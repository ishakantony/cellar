import { describe, it, expect, beforeEach } from 'vitest';
import { useCollectionModal } from './use-collection-modal';

const initialState = {
  isOpen: false,
  mode: null,
  collectionId: null,
};

describe('useCollectionModal store', () => {
  beforeEach(() => {
    useCollectionModal.setState(initialState);
  });

  it('starts in closed state with all nulls', () => {
    const state = useCollectionModal.getState();
    expect(state.isOpen).toBe(false);
    expect(state.mode).toBeNull();
    expect(state.collectionId).toBeNull();
  });

  it('openCreate sets isOpen=true, mode=create, collectionId=null', () => {
    useCollectionModal.getState().openCreate();
    const state = useCollectionModal.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('create');
    expect(state.collectionId).toBeNull();
  });

  it('openEdit sets isOpen=true, mode=edit, collectionId', () => {
    useCollectionModal.getState().openEdit('col-1');
    const state = useCollectionModal.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('edit');
    expect(state.collectionId).toBe('col-1');
  });

  it('close resets everything to initial state', () => {
    useCollectionModal.getState().openEdit('col-2');
    useCollectionModal.getState().close();
    const state = useCollectionModal.getState();
    expect(state.isOpen).toBe(false);
    expect(state.mode).toBeNull();
    expect(state.collectionId).toBeNull();
  });

  it('openEdit replaces openCreate while already open', () => {
    useCollectionModal.getState().openCreate();
    useCollectionModal.getState().openEdit('col-3');
    const state = useCollectionModal.getState();
    expect(state.mode).toBe('edit');
    expect(state.collectionId).toBe('col-3');
  });

  it('openCreate replaces openEdit while already open', () => {
    useCollectionModal.getState().openEdit('col-4');
    useCollectionModal.getState().openCreate();
    const state = useCollectionModal.getState();
    expect(state.mode).toBe('create');
    expect(state.collectionId).toBeNull();
  });

  it('openEdit with different ids updates collectionId', () => {
    useCollectionModal.getState().openEdit('col-5');
    useCollectionModal.getState().openEdit('col-6');
    const state = useCollectionModal.getState();
    expect(state.mode).toBe('edit');
    expect(state.collectionId).toBe('col-6');
  });
});
