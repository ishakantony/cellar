import { z } from 'zod';

const colorField = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex code like #aabbcc')
  .optional();

export const CreateCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  color: colorField,
});

export const UpdateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  color: colorField,
});

export const CollectionIdSchema = z.string().min(1);

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
