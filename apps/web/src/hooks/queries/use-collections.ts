import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api-fetch';
import { collectionKeys } from '../keys';
import type { AssetSummary } from './use-assets';

export type CollectionSummary = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  pinned: boolean;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CollectionWithAssets = CollectionSummary & {
  assets: Array<{
    assetId: string;
    collectionId: string;
    asset: AssetSummary;
  }>;
};

export function useCollectionsQuery() {
  return useQuery({
    queryKey: collectionKeys.list(),
    queryFn: () => apiFetch<CollectionSummary[]>('/api/collections'),
  });
}

export function useCollectionQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? collectionKeys.detail(id) : collectionKeys.detail('__none__'),
    queryFn: () => apiFetch<CollectionWithAssets>(`/api/collections/${id}`),
    enabled: !!id,
  });
}
