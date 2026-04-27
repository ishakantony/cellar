import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import {
  AssetIdSchema,
  AssetListQuerySchema,
  CreateAssetSchema,
  UpdateAssetSchema,
} from '@cellar/shared';

import { db } from '../db/client';
import { asset, assetPublicColumns, type AssetRow } from '../db/schema';
import { requireUser, type AuthVariables } from '../lib/session-middleware';

const PUBLIC_COLUMNS = assetPublicColumns;

type PublicAsset = Omit<AssetRow, 'searchVector'>;

async function deleteUploadedFile(relativeFilePath: string) {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const uploadsRoot = join(process.cwd(), uploadDir);
  const fullPath = join(uploadsRoot, relativeFilePath);
  if (!fullPath.startsWith(uploadsRoot)) return;
  await unlink(fullPath).catch(() => {});
}

export const assetsRoute = new Hono<{ Variables: AuthVariables }>()
  .use(requireUser)
  .get('/', zValidator('query', AssetListQuerySchema), async c => {
    const user = c.get('user');
    const { type, sort, q, limit = 20, offset = 0 } = c.req.valid('query');

    if (q) {
      const result = await db.execute<PublicAsset>(sql`
        SELECT id, "userId", "type"::text AS type, title, description, pinned, content, language, url,
               "filePath", "fileName", "mimeType", "fileSize", "createdAt", "updatedAt"
        FROM ${asset}
        WHERE "userId" = ${user.id}
          AND "searchVector" @@ plainto_tsquery('english', ${q})
          ${type ? sql`AND "type" = ${type}::"AssetType"` : sql``}
        ORDER BY pinned DESC, ts_rank("searchVector", plainto_tsquery('english', ${q})) DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      return c.json(result.rows as PublicAsset[]);
    }

    const orderBy = [
      desc(asset.pinned),
      sort === 'oldest'
        ? asc(asset.createdAt)
        : sort === 'az'
          ? asc(asset.title)
          : sort === 'za'
            ? desc(asset.title)
            : desc(asset.updatedAt),
    ];

    const where = type
      ? and(eq(asset.userId, user.id), eq(asset.type, type))
      : eq(asset.userId, user.id);

    const rows = await db
      .select(PUBLIC_COLUMNS)
      .from(asset)
      .where(where)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    return c.json(rows);
  })
  .get('/dashboard', async c => c.text('use /api/dashboard', 410))
  .get('/:id', async c => {
    const user = c.get('user');
    const idResult = AssetIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;

    const result = await db.query.asset.findFirst({
      where: and(eq(asset.id, id), eq(asset.userId, user.id)),
      columns: { searchVector: false },
      with: {
        collections: {
          with: { collection: true },
        },
      },
    });

    if (!result) return c.json({ error: 'Not found' }, 404);
    return c.json(result);
  })
  .post('/', zValidator('json', CreateAssetSchema), async c => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const [created] = await db
      .insert(asset)
      .values({
        ...data,
        userId: user.id,
      })
      .returning(PUBLIC_COLUMNS);
    return c.json(created, 201);
  })
  .patch('/:id', zValidator('json', UpdateAssetSchema), async c => {
    const user = c.get('user');
    const idResult = AssetIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;
    const data = c.req.valid('json');

    if (data.filePath !== undefined) {
      const existing = await db.query.asset.findFirst({
        where: and(eq(asset.id, id), eq(asset.userId, user.id)),
        columns: { filePath: true },
      });
      if (existing?.filePath && existing.filePath !== data.filePath) {
        await deleteUploadedFile(existing.filePath);
      }
    }

    const [updated] = await db
      .update(asset)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(asset.id, id), eq(asset.userId, user.id)))
      .returning(PUBLIC_COLUMNS);

    if (!updated) return c.json({ error: 'Not found' }, 404);
    return c.json(updated);
  })
  .delete('/:id', async c => {
    const user = c.get('user');
    const idResult = AssetIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;

    const existing = await db.query.asset.findFirst({
      where: and(eq(asset.id, id), eq(asset.userId, user.id)),
      columns: { filePath: true },
    });
    if (!existing) return c.json({ error: 'Not found' }, 404);
    if (existing.filePath) {
      await deleteUploadedFile(existing.filePath);
    }
    await db.delete(asset).where(and(eq(asset.id, id), eq(asset.userId, user.id)));
    return c.body(null, 204);
  })
  .post('/:id/pin', async c => {
    const user = c.get('user');
    const idResult = AssetIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;

    const existing = await db.query.asset.findFirst({
      where: and(eq(asset.id, id), eq(asset.userId, user.id)),
      columns: { pinned: true },
    });
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const [updated] = await db
      .update(asset)
      .set({ pinned: !existing.pinned, updatedAt: new Date() })
      .where(and(eq(asset.id, id), eq(asset.userId, user.id)))
      .returning(PUBLIC_COLUMNS);
    return c.json(updated);
  });
