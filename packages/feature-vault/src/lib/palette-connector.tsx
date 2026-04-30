/**
 * Vault palette connector — a null-rendering React component that reports
 * search results and recents to the shell's command palette via TanStack Query.
 * Queries appear in devtools and results are cached between palette opens.
 */
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Folder } from 'lucide-react';
import type { PaletteConnectorProps, PaletteItem } from '@cellar/shell-contract';
import { TYPE_CONFIG } from './asset-types';
import { getIconColorClass } from './colors';
import type { AssetSummary } from '../hooks/queries/use-assets';
import type { CollectionSummary } from '../hooks/queries/use-collections';

const SEARCH_LIMIT = 5;
const RECENT_LIMIT = 8;

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { credentials: 'include', signal });
  if (!response.ok) throw new Error(`Vault palette fetch failed: ${response.status}`);
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

async function searchVault(query: string, signal: AbortSignal): Promise<PaletteItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({ q: trimmed, limit: String(SEARCH_LIMIT) });
  const [assets, collections] = await Promise.all([
    fetchJson<AssetSummary[]>(`/api/vault/assets?${params.toString()}`, signal),
    fetchJson<CollectionSummary[]>('/api/vault/collections', signal),
  ]);
  const q = trimmed.toLowerCase();
  const matchedCollections = collections.filter(c => c.name.toLowerCase().includes(q));
  return [
    ...assets.slice(0, SEARCH_LIMIT).map(a => assetToItem(a, 'Assets')),
    ...matchedCollections.slice(0, SEARCH_LIMIT).map(c => collectionToItem(c)),
  ];
}

async function fetchRecents(): Promise<PaletteItem[]> {
  const assets = await fetchJson<AssetSummary[]>(
    `/api/vault/assets?sort=newest&limit=${RECENT_LIMIT}`
  );
  return assets.map(a => assetToItem(a, 'Recent'));
}

export function VaultPaletteConnector({ query, onResults }: PaletteConnectorProps) {
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  const isSearchMode = query.trim().length > 0;

  const search = useQuery({
    queryKey: ['vault', 'palette', 'search', query],
    queryFn: ({ signal }) => searchVault(query, signal),
    enabled: isSearchMode,
    staleTime: 60_000,
  });

  const recents = useQuery({
    queryKey: ['vault', 'palette', 'recents'],
    queryFn: () => fetchRecents(),
    enabled: !isSearchMode,
    staleTime: 30_000,
  });

  const active = isSearchMode ? search : recents;

  useEffect(() => {
    onResultsRef.current({
      items: active.data ?? [],
      isPending: active.isPending,
      isError: active.isError,
    });
  }, [active.data, active.isPending, active.isError]);

  return null;
}
