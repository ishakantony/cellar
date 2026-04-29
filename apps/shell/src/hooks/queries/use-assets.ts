import { useQuery } from '@tanstack/react-query';
import type { AssetListQuery, AssetType } from '@cellar/shared';
import { apiFetch } from '../../lib/api-fetch';
import { assetKeys } from '../keys';

export type AssetSummary = {
  id: string;
  userId: string;
  type: AssetType;
  title: string;
  description: string | null;
  pinned: boolean;
  content: string | null;
  language: string | null;
  url: string | null;
  filePath: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetWithCollections = AssetSummary & {
  collections: Array<{
    assetId: string;
    collectionId: string;
    collection: {
      id: string;
      name: string;
      description: string | null;
      color: string | null;
      pinned: boolean;
    };
  }>;
};

function buildQueryString(filters?: AssetListQuery): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.q) params.set('q', filters.q);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useAssetsQuery(filters?: AssetListQuery) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => apiFetch<AssetSummary[]>(`/api/vault/assets${buildQueryString(filters)}`),
  });
}

export function useAssetQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? assetKeys.detail(id) : assetKeys.detail('__none__'),
    queryFn: () => apiFetch<AssetWithCollections>(`/api/vault/assets/${id}`),
    enabled: !!id,
  });
}
