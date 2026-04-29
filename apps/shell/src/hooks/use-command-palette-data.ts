import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api-fetch';
// Vault-owned types/keys imported from the feature package per issue #003;
// the palette UI itself moves out of the shell in #014.
import {
  assetKeys,
  collectionKeys,
  type AssetSummary,
  type CollectionSummary,
} from '@cellar/feature-vault';
import type { PaletteAsset, PaletteCollection } from '../lib/command-palette-results';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommandPaletteData {
  searchAssets: PaletteAsset[];
  searchAssetTotal: number;
  recentAssets: PaletteAsset[];
  collections: PaletteCollection[];
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPaletteAsset(asset: AssetSummary): PaletteAsset {
  return {
    id: asset.id,
    title: asset.title,
    type: asset.type,
    pinned: asset.pinned,
    updatedAt: asset.updatedAt,
  };
}

function toPaletteCollection(c: CollectionSummary): PaletteCollection {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 150;
const SEARCH_LIMIT = 5;
const RECENT_LIMIT = 8;

export function useCommandPaletteData(query: string): CommandPaletteData {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const trimmedQuery = debouncedQuery.trim();

  // Debounced asset search — disabled when query is empty
  const searchQuery = useQuery({
    queryKey: assetKeys.list({ q: trimmedQuery, limit: SEARCH_LIMIT }),
    queryFn: async () => {
      const params = new URLSearchParams({ q: trimmedQuery, limit: String(SEARCH_LIMIT) });
      const response = await fetch(`/api/vault/assets?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const total = parseInt(response.headers.get('X-Total-Count') ?? '0', 10);
      const data: AssetSummary[] = await response.json();
      return { data, total };
    },
    enabled: trimmedQuery.length > 0,
    staleTime: 10_000,
  });

  // Recently-edited assets — always fetched while palette is in use
  const recentsQuery = useQuery({
    queryKey: assetKeys.list({ sort: 'newest', limit: RECENT_LIMIT }),
    queryFn: () => apiFetch<AssetSummary[]>(`/api/vault/assets?sort=newest&limit=${RECENT_LIMIT}`),
    staleTime: 30_000,
  });

  // Full collections list — cached
  const collectionsQuery = useQuery({
    queryKey: collectionKeys.list(),
    queryFn: () => apiFetch<CollectionSummary[]>('/api/vault/collections'),
    staleTime: 60_000,
  });

  const searchAssets = searchQuery.data?.data.map(toPaletteAsset) ?? [];
  const searchAssetTotal = searchQuery.data?.total ?? 0;
  const recentAssets = recentsQuery.data?.map(toPaletteAsset) ?? [];
  const collections = collectionsQuery.data?.map(toPaletteCollection) ?? [];

  // True while debounce hasn't fired yet (user typed but request not sent)
  const isDebouncing = query.trim().length > 0 && debouncedQuery.trim() !== query.trim();

  const isLoading =
    isDebouncing ||
    (trimmedQuery.length > 0 && searchQuery.isFetching) ||
    recentsQuery.isFetching ||
    collectionsQuery.isFetching;

  return {
    searchAssets: trimmedQuery.length > 0 ? searchAssets : [],
    searchAssetTotal: trimmedQuery.length > 0 ? searchAssetTotal : 0,
    recentAssets,
    collections,
    isLoading,
  };
}
