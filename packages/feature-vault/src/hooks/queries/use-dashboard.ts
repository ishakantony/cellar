import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api-fetch';
import { dashboardKey } from '../../lib/query-keys';
import type { AssetSummary } from './use-assets';
import type { CollectionSummary } from './use-collections';
import type { DashboardCounts } from '@cellar/shared';

export type DashboardData = {
  pinnedAssets: AssetSummary[];
  pinnedCollections: CollectionSummary[];
  recentAssets: AssetSummary[];
  counts: DashboardCounts;
};

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: () => apiFetch<DashboardData>('/api/vault/dashboard'),
  });
}
