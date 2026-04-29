import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCollectionInput, UpdateCollectionInput } from '@cellar/shared';
import { apiFetch } from '../../lib/api-fetch';
import { assetKeys, collectionKeys, dashboardKey } from '../../lib/query-keys';
import type { CollectionSummary } from '../queries/use-collections';

function invalidateCollectionTree(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: collectionKeys.all });
  qc.invalidateQueries({ queryKey: dashboardKey });
}

export function useCreateCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollectionInput) =>
      apiFetch<CollectionSummary>('/api/vault/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => invalidateCollectionTree(qc),
  });
}

export function useUpdateCollectionMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCollectionInput) =>
      apiFetch<CollectionSummary>(`/api/vault/collections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      invalidateCollectionTree(qc);
      qc.invalidateQueries({ queryKey: collectionKeys.detail(id) });
    },
  });
}

export function useDeleteCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/vault/collections/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateCollectionTree(qc),
  });
}

export function useToggleCollectionPinMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<CollectionSummary>(`/api/vault/collections/${id}/pin`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      invalidateCollectionTree(qc);
      qc.invalidateQueries({ queryKey: collectionKeys.detail(id) });
    },
  });
}

export function useAddAssetToCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, assetId }: { collectionId: string; assetId: string }) =>
      apiFetch<void>(`/api/vault/collections/${collectionId}/assets/${assetId}`, {
        method: 'POST',
      }),
    onSuccess: (_data, { collectionId }) => {
      invalidateCollectionTree(qc);
      qc.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
      qc.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

export function useRemoveAssetFromCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, assetId }: { collectionId: string; assetId: string }) =>
      apiFetch<void>(`/api/vault/collections/${collectionId}/assets/${assetId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, { collectionId }) => {
      invalidateCollectionTree(qc);
      qc.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
      qc.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
