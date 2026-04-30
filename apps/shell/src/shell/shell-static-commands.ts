import { PanelLeftClose } from 'lucide-react';
import type { PaletteCommand } from '@cellar/shell-contract';

/**
 * Custom DOM event key that the shell listens on to toggle the sidebar.
 * Shell-owned commands dispatch this event so feature packages never need to
 * import shell-owned Zustand stores.
 */
export const SHELL_TOGGLE_SIDEBAR_EVENT = 'cellar:toggle-sidebar';

/**
 * Static palette commands that belong to the shell itself — not to any feature.
 * These commands are available in every feature context and should never carry
 * `scope: 'feature'`.
 */
export const shellStaticCommands: PaletteCommand[] = [
  {
    id: 'shell-toggle-sidebar',
    label: 'Toggle sidebar',
    icon: PanelLeftClose,
    group: 'Quick Actions',
    kind: 'action',
    action: () => {
      document.dispatchEvent(new CustomEvent(SHELL_TOGGLE_SIDEBAR_EVENT));
    },
  },
];
