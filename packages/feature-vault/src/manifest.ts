import {
  Package,
  LayoutDashboard,
  Folder,
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  FileText,
  FolderPlus,
  LogOut,
  PanelLeftClose,
} from 'lucide-react';
import type { FeatureManifest, PaletteCommand } from '@cellar/shell-contract';
import { useAssetDrawer } from './hooks/use-asset-drawer';
import { useCollectionModal } from './hooks/use-collection-modal';

/**
 * Custom DOM event key that the shell listens on to toggle the sidebar.
 * Vault dispatches this event from its "Toggle sidebar" palette command so
 * the manifest doesn't need to import shell-owned Zustand stores.
 */
export const VAULT_TOGGLE_SIDEBAR_EVENT = 'cellar:toggle-sidebar';

/**
 * Static palette commands contributed by the Vault feature. These are
 * available eagerly (before the feature module loads) because they live in
 * the manifest. Navigation commands open a route; action commands invoke a
 * callback set at definition time using vault-owned Zustand stores.
 */
export const vaultStaticCommands: PaletteCommand[] = [
  // --- Navigation ---
  {
    id: 'vault-goto-vault',
    label: 'Go to Vault',
    icon: LayoutDashboard,
    group: 'Go To',
    kind: 'navigate',
    href: '/vault',
  },
  {
    id: 'vault-goto-assets',
    label: 'Go to Assets',
    icon: Package,
    group: 'Go To',
    kind: 'navigate',
    href: '/vault/assets',
  },
  {
    id: 'vault-goto-collections',
    label: 'Go to Collections',
    icon: Folder,
    group: 'Go To',
    kind: 'navigate',
    href: '/vault/collections',
  },

  // --- Quick Actions ---
  {
    id: 'vault-new-snippet',
    label: 'New Snippet',
    icon: Code,
    group: 'Quick Actions',
    kind: 'action',
    action: () => useAssetDrawer.getState().openCreate({ type: 'SNIPPET' }),
  },
  {
    id: 'vault-new-prompt',
    label: 'New Prompt',
    icon: Terminal,
    group: 'Quick Actions',
    kind: 'action',
    action: () => useAssetDrawer.getState().openCreate({ type: 'PROMPT' }),
  },
  {
    id: 'vault-new-link',
    label: 'New Link',
    icon: LinkIcon,
    group: 'Quick Actions',
    kind: 'action',
    action: () => useAssetDrawer.getState().openCreate({ type: 'LINK' }),
  },
  {
    id: 'vault-new-note',
    label: 'New Note',
    icon: StickyNote,
    group: 'Quick Actions',
    kind: 'action',
    action: () => useAssetDrawer.getState().openCreate({ type: 'NOTE' }),
  },
  {
    id: 'vault-new-image',
    label: 'New Image',
    icon: ImageIcon,
    group: 'Quick Actions',
    kind: 'action',
    action: () => useAssetDrawer.getState().openCreate({ type: 'IMAGE' }),
  },
  {
    id: 'vault-new-file',
    label: 'New File',
    icon: FileText,
    group: 'Quick Actions',
    kind: 'action',
    action: () => useAssetDrawer.getState().openCreate({ type: 'FILE' }),
  },
  {
    id: 'vault-new-collection',
    label: 'New Collection',
    icon: FolderPlus,
    group: 'Quick Actions',
    kind: 'action',
    action: () => useCollectionModal.getState().openCreate(),
  },
  {
    id: 'vault-sign-out',
    label: 'Sign out',
    icon: LogOut,
    group: 'Quick Actions',
    kind: 'action',
    action: async () => {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/sign-in';
    },
  },
  {
    id: 'vault-toggle-sidebar',
    label: 'Toggle sidebar',
    icon: PanelLeftClose,
    group: 'Quick Actions',
    kind: 'action',
    action: () => {
      document.dispatchEvent(new CustomEvent(VAULT_TOGGLE_SIDEBAR_EVENT));
    },
  },
];

/**
 * Eager Vault manifest. Real routes/nav/palette provider are filled in by
 * the lazy FeatureModule in index.tsx.
 */
export const manifest: FeatureManifest = {
  id: 'vault',
  label: 'Vault',
  icon: Package,
  basePath: '/vault',
  rail: true,
  staticCommands: vaultStaticCommands,
};

export default manifest;
