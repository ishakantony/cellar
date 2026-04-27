import type { AssetListQuery } from '@cellar/shared';

export const assetKeys = {
  all: ['assets'] as const,
  list: (filters?: AssetListQuery) => ['assets', 'list', filters ?? {}] as const,
  detail: (id: string) => ['assets', 'detail', id] as const,
};

export const collectionKeys = {
  all: ['collections'] as const,
  list: () => ['collections', 'list'] as const,
  detail: (id: string) => ['collections', 'detail', id] as const,
};

export const dashboardKey = ['dashboard'] as const;
export const settingsKey = ['settings'] as const;
