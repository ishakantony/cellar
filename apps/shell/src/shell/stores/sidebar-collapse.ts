import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const SIDEBAR_COLLAPSE_KEY = 'cellar:sidebar-collapsed';

export interface SidebarCollapseState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

/**
 * Persisted feature-sidebar collapse state. The current `AppShell` still
 * uses a local `useState` for backward compatibility; #006 wires this store
 * into the shell-level layout when the rail/header redesign lands.
 */
export const useSidebarCollapse = create<SidebarCollapseState>()(
  persist(
    set => ({
      collapsed: false,
      setCollapsed: (collapsed: boolean) => set({ collapsed }),
      toggle: () => set(s => ({ collapsed: !s.collapsed })),
    }),
    {
      name: SIDEBAR_COLLAPSE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
