import { z } from 'zod';
import { assetTypeSchema, ASSET_TYPES } from '../enums';

export const DashboardCountsByTypeSchema = z.object({
  SNIPPET: z.number().int().min(0),
  PROMPT: z.number().int().min(0),
  NOTE: z.number().int().min(0),
  LINK: z.number().int().min(0),
  IMAGE: z.number().int().min(0),
  FILE: z.number().int().min(0),
});

export const DashboardCountsSchema = z.object({
  total: z.number().int().min(0),
  byType: DashboardCountsByTypeSchema,
  pinnedCount: z.number().int().min(0),
});

export type DashboardCounts = z.infer<typeof DashboardCountsSchema>;
export type DashboardCountsByType = z.infer<typeof DashboardCountsByTypeSchema>;

// Re-export so consumers can use the AssetType enum for byType keys.
export { assetTypeSchema, ASSET_TYPES };
