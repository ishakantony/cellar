/**
 * Sidebar navigation entries.
 *
 * Issue #003 moves the source of truth for feature-specific nav into each
 * feature's `module.nav` array. The shell now reads from the registered
 * feature module (currently only Vault) and exposes its entries here as a
 * thin shim. Issue #005 will replace the whole sidebar with a feature-rail
 * driven by the registry, and the per-asset-type entries move to in-page
 * tabs in issue #007.
 */
import vaultModule from '@cellar/feature-vault';
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavEntry {
  href: string;
  icon: LucideIcon;
  label: string;
}

function isLucideIcon(icon: ComponentType<{ className?: string }> | undefined): icon is LucideIcon {
  return typeof icon === 'function' || typeof icon === 'object';
}

const vaultNavEntries: NavEntry[] = vaultModule.nav.flatMap(item => {
  if (!item.icon || !isLucideIcon(item.icon)) return [];
  return [{ href: item.href, icon: item.icon, label: item.label }];
});

// First three entries are the "general" Vault entries (Dashboard, All Items,
// All Collections); the remainder are the per-asset-type quick filters.
export const generalNav: NavEntry[] = vaultNavEntries.slice(0, 3);
export const assetNav: NavEntry[] = vaultNavEntries.slice(3);

/** All Go-To nav entries in palette order (general + asset types) */
export const allNavEntries: NavEntry[] = vaultNavEntries;
