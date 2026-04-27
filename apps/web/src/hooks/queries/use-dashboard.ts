import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api-fetch';
import { dashboardKey } from '../keys';
import type { AssetSummary } from './use-assets';
import type { CollectionSummary } from './use-collections';

export type DashboardData = {
  pinnedAssets: AssetSummary[];
  pinnedCollections: CollectionSummary[];
  recentAssets: AssetSummary[];
};

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: () => apiFetch<DashboardData>('/api/dashboard'),
  });
}
