import { z } from 'zod';
import { assetTypeSchema } from '../enums';

export const assetSortSchema = z.enum(['newest', 'oldest', 'az', 'za']);

export const AssetListQuerySchema = z.object({
  type: assetTypeSchema.optional(),
  sort: assetSortSchema.optional(),
  q: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type AssetSort = z.infer<typeof assetSortSchema>;
export type AssetListQuery = z.infer<typeof AssetListQuerySchema>;
