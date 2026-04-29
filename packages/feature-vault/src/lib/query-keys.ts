import type { AssetListQuery } from '@cellar/shared';

/**
 * TanStack Query keys for Vault. Owned by the feature so other features can't
 * accidentally invalidate Vault caches.
 */
export const assetKeys = {
  all: ['vault', 'assets'] as const,
  list: (filters?: AssetListQuery) => ['vault', 'assets', 'list', filters ?? {}] as const,
  detail: (id: string) => ['vault', 'assets', 'detail', id] as const,
};

export const collectionKeys = {
  all: ['vault', 'collections'] as const,
  list: () => ['vault', 'collections', 'list'] as const,
  detail: (id: string) => ['vault', 'collections', 'detail', id] as const,
};

export const dashboardKey = ['vault', 'dashboard'] as const;
