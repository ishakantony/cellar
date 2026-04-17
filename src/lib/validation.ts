import { z } from "zod";
import { AssetType } from "@/generated/prisma/enums";

// Helper to format Zod errors
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => `${e.path.join("")}: ${e.message}`).join(", ");
}

// Asset schemas
export const CreateAssetSchema = z.object({
  type: z.nativeEnum(AssetType),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  content: z.string().max(100000).optional(),
  language: z.string().max(50).optional(),
  url: z.string().url().optional(),
  filePath: z.string().max(500).optional(),
  fileName: z.string().max(200).optional(),
  mimeType: z.string().max(100).optional(),
  fileSize: z.number().int().min(0).optional(),
});

export const UpdateAssetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  content: z.string().max(100000).optional(),
  language: z.string().max(50).optional(),
  url: z.string().url().optional(),
});

// Collection schemas
export const CreateCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const UpdateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// ID validation schemas
export const AssetIdSchema = z.string().uuid();
export const CollectionIdSchema = z.string().uuid();

// Type exports for TypeScript
export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>;
export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
