import {
  Code,
  FileText,
  Folder,
  Image,
  LayoutDashboard,
  Link as LinkIcon,
  Package,
  StickyNote,
  Terminal,
} from 'lucide-react';
import type { FeatureModule, NavSection } from '@cellar/shell-contract';
import { VaultHomePage } from './routes/home';
import { AssetsListPage } from './routes/assets/index';
import { AssetDetailPage } from './routes/assets/$id';
import { CollectionsListPage } from './routes/collections/index';
import { CollectionDetailPage } from './routes/collections/$id';
import { VaultPaletteConnector } from './lib/palette-connector';

const nav: NavSection[] = [
  {
    title: 'General',
    items: [
      { id: 'home', label: 'Dashboard', href: '/vault', icon: LayoutDashboard },
      { id: 'assets', label: 'All Items', href: '/vault/assets', icon: Package },
      { id: 'collections', label: 'All Collections', href: '/vault/collections', icon: Folder },
    ],
  },
  {
    title: 'Assets',
    items: [
      { id: 'snippets', label: 'Snippets', href: '/vault/assets/snippets', icon: Code },
      { id: 'prompts', label: 'Prompts', href: '/vault/assets/prompts', icon: Terminal },
      { id: 'links', label: 'Links', href: '/vault/assets/links', icon: LinkIcon },
      { id: 'notes', label: 'Notes', href: '/vault/assets/notes', icon: StickyNote },
      { id: 'images', label: 'Images', href: '/vault/assets/images', icon: Image },
      { id: 'files', label: 'Files', href: '/vault/assets/files', icon: FileText },
    ],
  },
];

/**
 * Vault feature module. Routes are mounted under `/vault` by the shell's
 * route composer; the nav list here is consumed by the sidebar.
 */
const featureModule: FeatureModule = {
  routes: [
    { index: true, element: <VaultHomePage /> },
    { path: 'assets', element: <AssetsListPage /> },
    { path: 'assets/snippets', element: <AssetsListPage /> },
    { path: 'assets/prompts', element: <AssetsListPage /> },
    { path: 'assets/links', element: <AssetsListPage /> },
    { path: 'assets/notes', element: <AssetsListPage /> },
    { path: 'assets/images', element: <AssetsListPage /> },
    { path: 'assets/files', element: <AssetsListPage /> },
    { path: 'assets/:id', element: <AssetDetailPage /> },
    { path: 'collections', element: <CollectionsListPage /> },
    { path: 'collections/:id', element: <CollectionDetailPage /> },
  ],
  nav,
  PaletteConnector: VaultPaletteConnector,
};

export default featureModule;

/**
 * Re-export overlay UI that the shell hosts at the layout level (drawer for
 * asset CRUD, modal for collection CRUD). The shell mounts these overlays
 * once and the feature drives them via Zustand stores.
 */
export { AssetDrawer } from './components/assets/asset-drawer';
export { CollectionModal } from './components/collections/collection-modal';
export { useAssetDrawer } from './hooks/use-asset-drawer';
export { useCollectionModal } from './hooks/use-collection-modal';
