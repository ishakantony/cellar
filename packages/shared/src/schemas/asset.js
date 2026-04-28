import { z } from 'zod';
import { assetTypeSchema } from '../enums';
const urlField = z.string().url().or(z.literal('')).optional();
export const CreateAssetSchema = z.object({
  type: assetTypeSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  content: z.string().max(100000).optional(),
  language: z.string().max(50).optional(),
  url: urlField,
  filePath: z.string().max(500).optional(),
  fileName: z.string().max(200).optional(),
  mimeType: z.string().max(100).optional(),
  fileSize: z.number().int().min(0).optional(),
  collectionIds: z.string().array().optional(),
});
export const UpdateAssetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  content: z.string().max(100000).optional(),
  language: z.string().max(50).optional(),
  url: urlField,
  filePath: z.string().max(500).optional(),
  fileName: z.string().max(200).optional(),
  mimeType: z.string().max(100).optional(),
  fileSize: z.number().int().min(0).optional(),
  collectionIds: z.string().array().optional(),
});
// IDs are CUIDs, not UUIDs — accept any non-empty string.
export const AssetIdSchema = z.string().min(1);
//# sourceMappingURL=asset.js.map
