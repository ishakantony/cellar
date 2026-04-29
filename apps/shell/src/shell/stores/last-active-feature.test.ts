import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LAST_ACTIVE_FEATURE_KEY, DEFAULT_FEATURE_PATH } from './last-active-feature';

beforeEach(() => {
  localStorage.clear();
  // The store is module-scoped, so to test rehydration paths we re-import it
  // for each case. vitest's `vi.resetModules` clears the module cache.
  vi.resetModules();
});

describe('useLastActiveFeature', () => {
  it('falls back to the default path when localStorage is empty', async () => {
    const { useLastActiveFeature } = await import('./last-active-feature');
    expect(useLastActiveFeature.getState().path).toBe(DEFAULT_FEATURE_PATH);
  });

  it('persists writes to the documented localStorage key', async () => {
    const { useLastActiveFeature } = await import('./last-active-feature');
    useLastActiveFeature.getState().setPath('/toolbox/json-explorer');
    const raw = localStorage.getItem(LAST_ACTIVE_FEATURE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw as string).state.path).toBe('/toolbox/json-explorer');
  });

  it('rehydrates a previously written value across "reloads" (module re-import)', async () => {
    localStorage.setItem(
      LAST_ACTIVE_FEATURE_KEY,
      JSON.stringify({ state: { path: '/toolbox' }, version: 0 })
    );
    const { useLastActiveFeature } = await import('./last-active-feature');
    expect(useLastActiveFeature.getState().path).toBe('/toolbox');
  });

  it('falls back to the default when persisted JSON is malformed', async () => {
    localStorage.setItem(LAST_ACTIVE_FEATURE_KEY, '{not valid json');
    const { useLastActiveFeature } = await import('./last-active-feature');
    expect(useLastActiveFeature.getState().path).toBe(DEFAULT_FEATURE_PATH);
  });
});
