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
import type { FeatureModule, NavItem } from '@cellar/shell-contract';
import { VaultHomePage } from './routes/home';
import { AssetsListPage } from './routes/assets/index';
import { AssetDetailPage } from './routes/assets/$id';
import { CollectionsListPage } from './routes/collections/index';
import { CollectionDetailPage } from './routes/collections/$id';

const nav: NavItem[] = [
  { id: 'home', label: 'Dashboard', href: '/vault', icon: LayoutDashboard },
  { id: 'assets', label: 'All Items', href: '/vault/assets', icon: Package },
  { id: 'collections', label: 'All Collections', href: '/vault/collections', icon: Folder },
  // Per-asset-type quick filters. Issue #007 moves these to in-page tabs.
  { id: 'snippets', label: 'Snippets', href: '/vault/assets?type=SNIPPET', icon: Code },
  { id: 'prompts', label: 'Prompts', href: '/vault/assets?type=PROMPT', icon: Terminal },
  { id: 'links', label: 'Links', href: '/vault/assets?type=LINK', icon: LinkIcon },
  { id: 'notes', label: 'Notes', href: '/vault/assets?type=NOTE', icon: StickyNote },
  { id: 'images', label: 'Images', href: '/vault/assets?type=IMAGE', icon: Image },
  { id: 'files', label: 'Files', href: '/vault/assets?type=FILE', icon: FileText },
];

/**
 * Vault feature module. Routes are mounted under `/vault` by the shell's
 * route composer; the nav list here is consumed by the sidebar.
 */
const featureModule: FeatureModule = {
  routes: [
    { index: true, element: <VaultHomePage /> },
    { path: 'assets', element: <AssetsListPage /> },
    { path: 'assets/:id', element: <AssetDetailPage /> },
    { path: 'collections', element: <CollectionsListPage /> },
    { path: 'collections/:id', element: <CollectionDetailPage /> },
  ],
  nav,
};

export default featureModule;

/**
 * Re-export overlay UI that the shell hosts at the layout level (drawer for
 * asset CRUD, modal for collection CRUD). Issue #014 may relocate the
 * command palette UI out of the shell; until then, the shell mounts these
 * overlays once and the feature drives them via Zustand stores.
 */
export { AssetDrawer } from './components/assets/asset-drawer';
export { CollectionModal } from './components/collections/collection-modal';
export { useAssetDrawer } from './hooks/use-asset-drawer';
export { useCollectionModal } from './hooks/use-collection-modal';
export { getIconColorClass } from './lib/colors';

/**
 * Re-export query keys so the shell's command palette (which queries Vault
 * caches directly) and other features can invalidate without duplicating
 * the key tuples. Palette code itself moves out of the shell in issue #014.
 */
export { assetKeys, collectionKeys, dashboardKey } from './lib/query-keys';
export type { AssetSummary, AssetWithCollections } from './hooks/queries/use-assets';
export type { CollectionSummary, CollectionWithAssets } from './hooks/queries/use-collections';
