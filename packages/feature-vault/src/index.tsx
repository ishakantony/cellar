import { Folder, LayoutDashboard, Package } from 'lucide-react';
import type { FeatureModule, NavItem } from '@cellar/shell-contract';
import { VaultHomePage } from './routes/home';
import { AssetsListPage } from './routes/assets/index';
import { AssetDetailPage } from './routes/assets/$id';
import { CollectionsListPage } from './routes/collections/index';
import { CollectionDetailPage } from './routes/collections/$id';
import { vaultPaletteProvider } from './lib/palette-provider';

const nav: NavItem[] = [
  { id: 'home', label: 'Dashboard', href: '/vault', icon: LayoutDashboard },
  { id: 'assets', label: 'All Items', href: '/vault/assets', icon: Package },
  { id: 'collections', label: 'All Collections', href: '/vault/collections', icon: Folder },
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
  paletteProvider: vaultPaletteProvider,
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
