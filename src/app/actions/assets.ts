'use server';

import { prisma } from '@/lib/prisma';
import { AssetType } from '@/generated/prisma/enums';
import { Prisma } from '@/generated/prisma/client';
import { revalidatePath } from 'next/cache';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { getUser } from '@/lib/session';
import { CreateAssetSchema, UpdateAssetSchema, formatZodError } from '@/lib/validation';

export async function createAsset(data: {
  type: AssetType;
  title: string;
  description?: string;
  content?: string;
  language?: string;
  url?: string;
  filePath?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}) {
  // Validate input
  const validated = CreateAssetSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(`Validation failed: ${formatZodError(validated.error)}`);
  }

  const user = await getUser();
  const asset = await prisma.asset.create({
    data: {
      ...validated.data,
      userId: user.id,
    },
  });
  revalidatePath('/dashboard');
  revalidatePath('/assets');
  return asset;
}

export async function updateAsset(
  id: string,
  data: {
    title?: string;
    description?: string;
    content?: string;
    language?: string;
    url?: string;
    filePath?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
  }
) {
  // Validate input
  const validated = UpdateAssetSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(`Validation failed: ${formatZodError(validated.error)}`);
  }

  const user = await getUser();

  // If filePath is changing, delete the old file from disk
  if (validated.data.filePath !== undefined) {
    const existing = await prisma.asset.findUnique({
      where: { id, userId: user.id },
    });
    if (existing?.filePath && existing.filePath !== validated.data.filePath) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const uploadsRoot = join(process.cwd(), uploadDir);
      const fullPath = join(uploadsRoot, existing.filePath);
      if (fullPath.startsWith(uploadsRoot + '/') || fullPath.startsWith(uploadsRoot + '\\')) {
        await unlink(fullPath).catch(() => {});
      }
    }
  }

  const asset = await prisma.asset.update({
    where: { id, userId: user.id },
    data: validated.data,
  });
  revalidatePath('/dashboard');
  revalidatePath('/assets');
  revalidatePath('/collections');
  return asset;
}

export async function deleteAsset(id: string) {
  const user = await getUser();
  const asset = await prisma.asset.findUnique({
    where: { id, userId: user.id },
  });
  if (!asset) throw new Error('Resource not found or access denied');

  // Remove file from disk if it's an image or file type
  if (asset.filePath) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const uploadsRoot = join(process.cwd(), uploadDir);
    const fullPath = join(uploadsRoot, asset.filePath);
    // Prevent path traversal: ensure the resolved path stays within uploads
    if (fullPath.startsWith(uploadsRoot + '/') || fullPath.startsWith(uploadsRoot + '\\')) {
      await unlink(fullPath).catch(() => {});
    }
  }

  await prisma.asset.delete({ where: { id, userId: user.id } });
  revalidatePath('/dashboard');
  revalidatePath('/assets');
}

export async function getAssets(filters?: {
  type?: AssetType;
  sort?: 'newest' | 'oldest' | 'az' | 'za';
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const user = await getUser();
  const limit = filters?.limit ?? 20;
  const offset = filters?.offset ?? 0;

  // Full-text search
  if (filters?.q) {
    const assets = await prisma.$queryRaw<
      Array<{
        id: string;
        userId: string;
        type: AssetType;
        title: string;
        description: string | null;
        pinned: boolean;
        content: string | null;
        language: string | null;
        url: string | null;
        filePath: string | null;
        fileName: string | null;
        mimeType: string | null;
        fileSize: number | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
      SELECT "id", "userId", "type", "title", "description", "pinned", "content", "language", "url", "filePath", "fileName", "mimeType", "fileSize", "createdAt", "updatedAt"
      FROM "Asset"
      WHERE "userId" = ${user.id}
      AND "searchVector" @@ plainto_tsquery('english', ${filters.q})
      ${filters.type ? Prisma.sql`AND "type" = ${filters.type}::"AssetType"` : Prisma.empty}
      ORDER BY "pinned" DESC, ts_rank("searchVector", plainto_tsquery('english', ${filters.q})) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return assets;
  }

  const orderBy: Prisma.AssetOrderByWithRelationInput[] = [
    { pinned: 'desc' },
    filters?.sort === 'oldest'
      ? { createdAt: 'asc' }
      : filters?.sort === 'az'
        ? { title: 'asc' }
        : filters?.sort === 'za'
          ? { title: 'desc' }
          : { updatedAt: 'desc' },
  ];

  return prisma.asset.findMany({
    where: {
      userId: user.id,
      ...(filters?.type && { type: filters.type }),
    },
    orderBy,
    take: limit,
    skip: offset,
  });
}

export async function getAsset(id: string) {
  const user = await getUser();
  return prisma.asset.findUnique({
    where: { id, userId: user.id },
    include: {
      collections: {
        include: { collection: true },
      },
    },
  });
}

export async function togglePin(id: string) {
  const user = await getUser();
  const asset = await prisma.asset.findUnique({
    where: { id, userId: user.id },
  });
  if (!asset) throw new Error('Resource not found or access denied');
  await prisma.asset.update({
    where: { id, userId: user.id },
    data: { pinned: !asset.pinned },
  });
  revalidatePath('/dashboard');
  revalidatePath('/assets');
}

export async function getDashboardData() {
  const user = await getUser();

  const [pinnedAssets, pinnedCollections, recentAssets] = await Promise.all([
    prisma.asset.findMany({
      where: { userId: user.id, pinned: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.collection.findMany({
      where: { userId: user.id, pinned: true },
      include: { _count: { select: { assets: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.asset.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ]);

  return { pinnedAssets, pinnedCollections, recentAssets };
}
