import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, count, desc, eq } from 'drizzle-orm';
import {
  CollectionIdSchema,
  CreateCollectionSchema,
  UpdateCollectionSchema,
  AssetIdSchema,
} from '@cellar/shared';

import { db } from '../../db/client';
import { asset, assetCollection, collection, assetPublicColumns } from '../../db/schema';
import { requireUser, type AuthVariables } from '../../lib/session-middleware';

const AddAssetParamSchema = AssetIdSchema;

export const collectionsRoute = new Hono<{ Variables: AuthVariables }>()
  .use(requireUser)
  .get('/', async c => {
    const user = c.get('user');
    const rows = await db
      .select({
        id: collection.id,
        userId: collection.userId,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        pinned: collection.pinned,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        assetCount: count(assetCollection.assetId),
      })
      .from(collection)
      .leftJoin(assetCollection, eq(assetCollection.collectionId, collection.id))
      .where(eq(collection.userId, user.id))
      .groupBy(collection.id)
      .orderBy(desc(collection.pinned), desc(collection.updatedAt));
    return c.json(rows);
  })
  .get('/:id', async c => {
    const user = c.get('user');
    const idResult = CollectionIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;

    const collectionRow = await db.query.collection.findFirst({
      where: and(eq(collection.id, id), eq(collection.userId, user.id)),
    });
    if (!collectionRow) return c.json({ error: 'Not found' }, 404);

    // Fetch linked assets, excluding the searchVector column.
    const links = await db
      .select({
        assetId: assetCollection.assetId,
        ...assetPublicColumns,
      })
      .from(assetCollection)
      .innerJoin(asset, eq(asset.id, assetCollection.assetId))
      .where(eq(assetCollection.collectionId, id))
      .orderBy(desc(asset.updatedAt));

    return c.json({
      ...collectionRow,
      assetCount: links.length,
      assets: links.map(link => ({
        assetId: link.assetId,
        collectionId: id,
        asset: {
          id: link.id,
          userId: link.userId,
          type: link.type,
          title: link.title,
          description: link.description,
          pinned: link.pinned,
          content: link.content,
          language: link.language,
          url: link.url,
          filePath: link.filePath,
          fileName: link.fileName,
          mimeType: link.mimeType,
          fileSize: link.fileSize,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
        },
      })),
    });
  })
  .post('/', zValidator('json', CreateCollectionSchema), async c => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const [created] = await db
      .insert(collection)
      .values({ ...data, userId: user.id })
      .returning();
    return c.json(created, 201);
  })
  .patch('/:id', zValidator('json', UpdateCollectionSchema), async c => {
    const user = c.get('user');
    const idResult = CollectionIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;

    const [updated] = await db
      .update(collection)
      .set({ ...c.req.valid('json'), updatedAt: new Date() })
      .where(and(eq(collection.id, id), eq(collection.userId, user.id)))
      .returning();
    if (!updated) return c.json({ error: 'Not found' }, 404);
    return c.json(updated);
  })
  .delete('/:id', async c => {
    const user = c.get('user');
    const idResult = CollectionIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;

    const result = await db
      .delete(collection)
      .where(and(eq(collection.id, id), eq(collection.userId, user.id)))
      .returning({ id: collection.id });
    if (result.length === 0) return c.json({ error: 'Not found' }, 404);
    return c.body(null, 204);
  })
  .post('/:id/pin', async c => {
    const user = c.get('user');
    const idResult = CollectionIdSchema.safeParse(c.req.param('id'));
    if (!idResult.success) return c.json({ error: 'Invalid id' }, 400);
    const id = idResult.data;

    const existing = await db.query.collection.findFirst({
      where: and(eq(collection.id, id), eq(collection.userId, user.id)),
      columns: { pinned: true },
    });
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const [updated] = await db
      .update(collection)
      .set({ pinned: !existing.pinned, updatedAt: new Date() })
      .where(and(eq(collection.id, id), eq(collection.userId, user.id)))
      .returning();
    return c.json(updated);
  })
  .post('/:id/assets/:assetId', async c => {
    const user = c.get('user');
    const collectionResult = CollectionIdSchema.safeParse(c.req.param('id'));
    const assetResult = AddAssetParamSchema.safeParse(c.req.param('assetId'));
    if (!collectionResult.success || !assetResult.success) {
      return c.json({ error: 'Invalid id' }, 400);
    }
    const collectionId = collectionResult.data;
    const assetId = assetResult.data;

    const [foundCollection, foundAsset] = await Promise.all([
      db.query.collection.findFirst({
        where: and(eq(collection.id, collectionId), eq(collection.userId, user.id)),
        columns: { id: true },
      }),
      db.query.asset.findFirst({
        where: and(eq(asset.id, assetId), eq(asset.userId, user.id)),
        columns: { id: true },
      }),
    ]);
    if (!foundCollection || !foundAsset) {
      return c.json({ error: 'Not found' }, 404);
    }

    await db.insert(assetCollection).values({ assetId, collectionId }).onConflictDoNothing();
    return c.body(null, 204);
  })
  .delete('/:id/assets/:assetId', async c => {
    const user = c.get('user');
    const collectionResult = CollectionIdSchema.safeParse(c.req.param('id'));
    const assetResult = AddAssetParamSchema.safeParse(c.req.param('assetId'));
    if (!collectionResult.success || !assetResult.success) {
      return c.json({ error: 'Invalid id' }, 400);
    }
    const collectionId = collectionResult.data;
    const assetId = assetResult.data;

    const [foundCollection, foundAsset] = await Promise.all([
      db.query.collection.findFirst({
        where: and(eq(collection.id, collectionId), eq(collection.userId, user.id)),
        columns: { id: true },
      }),
      db.query.asset.findFirst({
        where: and(eq(asset.id, assetId), eq(asset.userId, user.id)),
        columns: { id: true },
      }),
    ]);
    if (!foundCollection || !foundAsset) {
      return c.json({ error: 'Not found' }, 404);
    }

    await db
      .delete(assetCollection)
      .where(
        and(eq(assetCollection.assetId, assetId), eq(assetCollection.collectionId, collectionId))
      );
    return c.body(null, 204);
  });
