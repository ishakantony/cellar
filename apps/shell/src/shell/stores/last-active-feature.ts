import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const LAST_ACTIVE_FEATURE_KEY = 'cellar:last-active-feature';
export const DEFAULT_FEATURE_PATH = '/vault';

export interface LastActiveFeatureState {
  path: string;
  setPath: (path: string) => void;
}

/**
 * Remembers the path of the last feature the user touched so the shell can
 * route them back there on next visit. Default falls back to `/vault`.
 */
export const useLastActiveFeature = create<LastActiveFeatureState>()(
  persist(
    set => ({
      path: DEFAULT_FEATURE_PATH,
      setPath: (path: string) => set({ path }),
    }),
    {
      name: LAST_ACTIVE_FEATURE_KEY,
      storage: createJSONStorage(() => localStorage),
      // If the persisted blob is corrupt, fall back to the default and
      // overwrite on next write rather than erroring out.
      onRehydrateStorage: () => state => {
        if (!state || typeof state.path !== 'string' || state.path.length === 0) {
          // The store keeps its default initialState here — nothing to do.
        }
      },
    }
  )
);
