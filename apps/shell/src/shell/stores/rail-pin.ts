import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const RAIL_PIN_KEY = 'cellar:rail-pinned';

export interface RailPinState {
  pinned: boolean;
  setPinned: (pinned: boolean) => void;
  toggle: () => void;
}

/**
 * Whether the rail is pinned wide vs. icon-only. Persisted across reloads.
 * Default: not pinned.
 */
export const useRailPin = create<RailPinState>()(
  persist(
    set => ({
      pinned: false,
      setPinned: (pinned: boolean) => set({ pinned }),
      toggle: () => set(s => ({ pinned: !s.pinned })),
    }),
    {
      name: RAIL_PIN_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
