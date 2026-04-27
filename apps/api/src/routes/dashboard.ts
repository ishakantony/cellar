import { Hono } from 'hono';
import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { asset, assetCollection, assetPublicColumns, collection } from '../db/schema';
import { requireUser, type AuthVariables } from '../lib/session-middleware';

export const dashboardRoute = new Hono<{ Variables: AuthVariables }>()
  .use(requireUser)
  .get('/', async c => {
    const user = c.get('user');

    const [pinnedAssets, pinnedCollections, recentAssets] = await Promise.all([
      db
        .select(assetPublicColumns)
        .from(asset)
        .where(and(eq(asset.userId, user.id), eq(asset.pinned, true)))
        .orderBy(desc(asset.updatedAt))
        .limit(20),
      db
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
        .where(and(eq(collection.userId, user.id), eq(collection.pinned, true)))
        .groupBy(collection.id)
        .orderBy(desc(collection.updatedAt))
        .limit(20),
      db
        .select(assetPublicColumns)
        .from(asset)
        .where(eq(asset.userId, user.id))
        .orderBy(desc(asset.updatedAt))
        .limit(10),
    ]);

    return c.json({ pinnedAssets, pinnedCollections, recentAssets });
  });
