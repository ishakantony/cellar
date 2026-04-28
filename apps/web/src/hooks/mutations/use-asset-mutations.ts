import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateAssetInput, UpdateAssetInput } from '@cellar/shared';
import { apiFetch } from '../../lib/api-fetch';
import { assetKeys, collectionKeys, dashboardKey } from '../keys';
import type { AssetSummary } from '../queries/use-assets';

type CreateAssetPayload = CreateAssetInput & { collectionIds?: string[] };
type UpdateAssetPayload = UpdateAssetInput & { collectionIds?: string[] };

function invalidateAssetTree(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: assetKeys.all });
  qc.invalidateQueries({ queryKey: dashboardKey });
}

export function useCreateAssetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssetPayload) =>
      apiFetch<AssetSummary>('/api/assets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      invalidateAssetTree(qc);
      qc.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useUpdateAssetMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAssetPayload) =>
      apiFetch<AssetSummary>(`/api/assets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      invalidateAssetTree(qc);
      qc.invalidateQueries({ queryKey: assetKeys.detail(id) });
      qc.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useDeleteAssetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/assets/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidateAssetTree(qc);
      qc.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useTogglePinAssetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<AssetSummary>(`/api/assets/${id}/pin`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      invalidateAssetTree(qc);
      qc.invalidateQueries({ queryKey: assetKeys.detail(id) });
    },
  });
}
