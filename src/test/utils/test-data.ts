import { AssetType } from '@/generated/prisma/enums';

export function createMockAsset(
  overrides: Partial<{
    id: string;
    userId: string;
    type: AssetType;
    title: string;
    description: string | null;
    content: string | null;
    language: string | null;
    url: string | null;
    filePath: string | null;
    fileName: string | null;
    mimeType: string | null;
    fileSize: number | null;
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: 'asset-123',
    userId: 'user-123',
    type: AssetType.SNIPPET,
    title: 'Test Asset',
    description: null,
    content: null,
    language: null,
    url: null,
    filePath: null,
    fileName: null,
    mimeType: null,
    fileSize: null,
    pinned: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockCollection(
  overrides: Partial<{
    id: string;
    userId: string;
    name: string;
    description: string | null;
    color: string | null;
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: 'collection-123',
    userId: 'user-123',
    name: 'Test Collection',
    description: null,
    color: null,
    pinned: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockAssetCollection(
  overrides: Partial<{
    assetId: string;
    collectionId: string;
    createdAt: Date;
  }> = {}
) {
  return {
    assetId: 'asset-123',
    collectionId: 'collection-123',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
