/**
 * Vault palette provider — runs outside React, uses raw fetch (not TanStack
 * Query) so it can be called by the shell's aggregator on every keystroke
 * without a query client dependency.
 */
import type { PaletteProvider, PaletteItem } from '@cellar/shell-contract';
import { TYPE_CONFIG } from './asset-types';
import { getIconColorClass } from './colors';
import { Folder } from 'lucide-react';
import type { AssetSummary } from '../hooks/queries/use-assets';
import type { CollectionSummary } from '../hooks/queries/use-collections';

const SEARCH_LIMIT = 5;
const RECENT_LIMIT = 8;

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    signal,
  });
  if (!response.ok) {
    throw new Error(`Vault palette fetch failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function assetToItem(asset: AssetSummary, group: string): PaletteItem {
  const typeConfig = TYPE_CONFIG[asset.type];
  const Icon = typeConfig?.icon;
  return {
    id: `vault-asset-${asset.id}`,
    label: asset.title,
    description: typeConfig?.label ?? asset.type,
    group,
    href: `/vault/assets/${asset.id}`,
    icon: Icon,
  };
}

function collectionToItem(collection: CollectionSummary): PaletteItem {
  const colorClass = getIconColorClass(collection.color);
  // Inline a wrapper component so the icon renders with the right color class.
  // ComponentType must be stable between renders; we create it per-collection
  // inside the search call (acceptable since items are not rendered in React
  // directly — the palette UI renders them once per search result set).
  const CollectionIcon = ({ className }: { className?: string }) => (
    <Folder className={[className, colorClass].filter(Boolean).join(' ')} />
  );

  return {
    id: `vault-collection-${collection.id}`,
    label: collection.name,
    group: 'Collections',
    href: `/vault/collections/${collection.id}`,
    icon: CollectionIcon,
  };
}

export const vaultPaletteProvider: PaletteProvider = {
  async search(query: string, signal: AbortSignal): Promise<PaletteItem[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const params = new URLSearchParams({ q: trimmed, limit: String(SEARCH_LIMIT) });

    // Fetch assets and collections in parallel
    const [assets, collections] = await Promise.all([
      fetchJson<AssetSummary[]>(`/api/vault/assets?${params.toString()}`, signal),
      // Collections list is small; load all and filter client-side (matches
      // what use-command-palette-data.ts did previously).
      fetchJson<CollectionSummary[]>('/api/vault/collections', signal),
    ]);

    const q = trimmed.toLowerCase();
    const matchedCollections = collections.filter(c => c.name.toLowerCase().includes(q));

    const assetItems = assets.slice(0, SEARCH_LIMIT).map(a => assetToItem(a, 'Assets'));
    const collectionItems = matchedCollections.slice(0, SEARCH_LIMIT).map(c => collectionToItem(c));

    return [...assetItems, ...collectionItems];
  },

  async getRecent(): Promise<PaletteItem[]> {
    const assets = await fetchJson<AssetSummary[]>(
      `/api/vault/assets?sort=newest&limit=${RECENT_LIMIT}`
    );
    return assets.map(a => assetToItem(a, 'Recent'));
  },
};
