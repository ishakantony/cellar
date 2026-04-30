/**
 * Vault palette connector — a null-rendering React component that reports
 * search results and recents to the shell's command palette via TanStack Query.
 * Queries appear in devtools and results are cached between palette opens.
 *
 * Search mode reports two independent groups so collections (client-side filter)
 * can appear immediately while the asset server query is still in flight.
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

async function fetchAssets(query: string, signal: AbortSignal): Promise<AssetSummary[]> {
  const params = new URLSearchParams({ q: query.trim(), limit: String(SEARCH_LIMIT) });
  return fetchJson<AssetSummary[]>(`/api/vault/assets?${params.toString()}`, signal);
}

async function fetchAllCollections(signal: AbortSignal): Promise<CollectionSummary[]> {
  return fetchJson<CollectionSummary[]>('/api/vault/collections', signal);
}

async function fetchRecents(): Promise<AssetSummary[]> {
  return fetchJson<AssetSummary[]>(`/api/vault/assets?sort=newest&limit=${RECENT_LIMIT}`);
}

export function VaultPaletteConnector({ query, onResults }: PaletteConnectorProps) {
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  const isSearchMode = query.trim().length > 0;

  const assetsQuery = useQuery({
    queryKey: ['vault', 'palette', 'search', 'assets', query],
    queryFn: ({ signal }) => fetchAssets(query, signal),
    enabled: isSearchMode,
    staleTime: 60_000,
  });

  const collectionsQuery = useQuery({
    queryKey: ['vault', 'palette', 'search', 'collections'],
    queryFn: ({ signal }) => fetchAllCollections(signal),
    enabled: isSearchMode,
    staleTime: 60_000,
  });

  const recentsQuery = useQuery({
    queryKey: ['vault', 'palette', 'recents'],
    queryFn: () => fetchRecents(),
    enabled: !isSearchMode,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isSearchMode) {
      onResultsRef.current([
        {
          id: 'vault-recent',
          label: 'Vault',
          items: (recentsQuery.data ?? []).map(a => assetToItem(a, 'Recent')),
          isPending: recentsQuery.isPending,
          isError: recentsQuery.isError,
        },
      ]);
      return;
    }

    const q = query.trim().toLowerCase();
    const matchedCollections = (collectionsQuery.data ?? [])
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, SEARCH_LIMIT)
      .map(c => collectionToItem(c));

    onResultsRef.current([
      {
        id: 'vault-assets',
        label: 'Vault – Assets',
        items: (assetsQuery.data ?? []).map(a => assetToItem(a, 'Vault – Assets')),
        isPending: assetsQuery.isPending,
        isError: assetsQuery.isError,
      },
      {
        id: 'vault-collections',
        label: 'Vault – Collections',
        items: matchedCollections,
        isPending: collectionsQuery.isPending,
        isError: collectionsQuery.isError,
      },
    ]);
  }, [
    isSearchMode,
    query,
    assetsQuery.data,
    assetsQuery.isPending,
    assetsQuery.isError,
    collectionsQuery.data,
    collectionsQuery.isPending,
    collectionsQuery.isError,
    recentsQuery.data,
    recentsQuery.isPending,
    recentsQuery.isError,
  ]);

  return null;
}
