import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ResolvedFeatureRegistryEntry } from '@/shell/route-composer';
import type { NavEntry } from './command-palette-results';

function isLucideIcon(icon: ComponentType<{ className?: string }> | undefined): icon is LucideIcon {
  return typeof icon === 'function' || typeof icon === 'object';
}

/**
 * Flatten every registered feature's `module.nav` into the {@link NavEntry}
 * shape consumed by the command palette's "Go To" group. Items without a
 * Lucide icon are dropped — the palette currently relies on the lucide shape
 * for its icon map. Order is preserved across features.
 */
export function buildNavEntries(resolved: ResolvedFeatureRegistryEntry[]): NavEntry[] {
  const entries: NavEntry[] = [];
  for (const { module } of resolved) {
    for (const item of module.nav) {
      if (!item.icon || !isLucideIcon(item.icon)) continue;
      entries.push({ href: item.href, icon: item.icon, label: item.label });
    }
  }
  return entries;
}
