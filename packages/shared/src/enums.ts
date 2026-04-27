import { z } from 'zod';

export const ASSET_TYPES = ['SNIPPET', 'PROMPT', 'NOTE', 'LINK', 'IMAGE', 'FILE'] as const;

export const assetTypeSchema = z.enum(ASSET_TYPES);

export type AssetType = z.infer<typeof assetTypeSchema>;

export const AssetType = {
  SNIPPET: 'SNIPPET',
  PROMPT: 'PROMPT',
  NOTE: 'NOTE',
  LINK: 'LINK',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
} as const satisfies Record<AssetType, AssetType>;
