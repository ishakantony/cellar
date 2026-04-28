import { describe, it, expect, beforeEach } from 'vitest';
import { useAssetDrawer } from './use-asset-drawer';

const initialState = {
  isOpen: false,
  mode: null,
  assetId: null,
  initialType: null,
  initialCollectionId: null,
};

describe('useAssetDrawer store', () => {
  beforeEach(() => {
    useAssetDrawer.setState(initialState);
  });

  it('starts in closed state with all nulls', () => {
    const state = useAssetDrawer.getState();
    expect(state.isOpen).toBe(false);
    expect(state.mode).toBeNull();
    expect(state.assetId).toBeNull();
    expect(state.initialType).toBeNull();
    expect(state.initialCollectionId).toBeNull();
  });

  it('openView sets isOpen=true, mode=view, assetId', () => {
    useAssetDrawer.getState().openView('asset-1');
    const state = useAssetDrawer.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('view');
    expect(state.assetId).toBe('asset-1');
    expect(state.initialType).toBeNull();
    expect(state.initialCollectionId).toBeNull();
  });

  it('openEdit sets isOpen=true, mode=edit, assetId', () => {
    useAssetDrawer.getState().openEdit('asset-2');
    const state = useAssetDrawer.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('edit');
    expect(state.assetId).toBe('asset-2');
    expect(state.initialType).toBeNull();
    expect(state.initialCollectionId).toBeNull();
  });

  it('openCreate with no options sets isOpen=true, mode=create, nulls everything else', () => {
    useAssetDrawer.getState().openCreate();
    const state = useAssetDrawer.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('create');
    expect(state.assetId).toBeNull();
    expect(state.initialType).toBeNull();
    expect(state.initialCollectionId).toBeNull();
  });

  it('openCreate with type pre-selects the type', () => {
    useAssetDrawer.getState().openCreate({ type: 'SNIPPET' });
    const state = useAssetDrawer.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('create');
    expect(state.initialType).toBe('SNIPPET');
    expect(state.initialCollectionId).toBeNull();
  });

  it('openCreate with collectionId pre-selects the collection', () => {
    useAssetDrawer.getState().openCreate({ collectionId: 'col-99' });
    const state = useAssetDrawer.getState();
    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('create');
    expect(state.initialType).toBeNull();
    expect(state.initialCollectionId).toBe('col-99');
  });

  it('openCreate with both type and collectionId sets both', () => {
    useAssetDrawer.getState().openCreate({ type: 'NOTE', collectionId: 'col-42' });
    const state = useAssetDrawer.getState();
    expect(state.initialType).toBe('NOTE');
    expect(state.initialCollectionId).toBe('col-42');
  });

  it('close resets everything to initial state', () => {
    useAssetDrawer.getState().openView('asset-3');
    useAssetDrawer.getState().close();
    const state = useAssetDrawer.getState();
    expect(state.isOpen).toBe(false);
    expect(state.mode).toBeNull();
    expect(state.assetId).toBeNull();
    expect(state.initialType).toBeNull();
    expect(state.initialCollectionId).toBeNull();
  });

  it('replaces openView with openEdit while already open', () => {
    useAssetDrawer.getState().openView('asset-1');
    useAssetDrawer.getState().openEdit('asset-2');
    const state = useAssetDrawer.getState();
    expect(state.mode).toBe('edit');
    expect(state.assetId).toBe('asset-2');
  });

  it('replaces openView with openCreate while already open', () => {
    useAssetDrawer.getState().openView('asset-1');
    useAssetDrawer.getState().openCreate({ type: 'LINK' });
    const state = useAssetDrawer.getState();
    expect(state.mode).toBe('create');
    expect(state.assetId).toBeNull();
    expect(state.initialType).toBe('LINK');
  });

  it('replaces openCreate with openView while already open', () => {
    useAssetDrawer.getState().openCreate({ type: 'NOTE' });
    useAssetDrawer.getState().openView('asset-x');
    const state = useAssetDrawer.getState();
    expect(state.mode).toBe('view');
    expect(state.assetId).toBe('asset-x');
    expect(state.initialType).toBeNull();
  });
});
