import { Hono } from 'hono';
import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { asset, assetCollection, assetPublicColumns, collection } from '../db/schema';
import { requireUser, type AuthVariables } from '../lib/session-middleware';
import { ASSET_TYPES, type DashboardCounts } from '@cellar/shared';

export const dashboardRoute = new Hono<{ Variables: AuthVariables }>()
  .use(requireUser)
  .get('/', async c => {
    const user = c.get('user');

    const [pinnedAssets, pinnedCollections, recentAssets, countsByType, pinnedCountResult] =
      await Promise.all([
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
        db
          .select({ type: asset.type, count: count() })
          .from(asset)
          .where(eq(asset.userId, user.id))
          .groupBy(asset.type),
        db
          .select({ count: count() })
          .from(asset)
          .where(and(eq(asset.userId, user.id), eq(asset.pinned, true))),
      ]);

    // Build byType with zeros for any type not present in the GROUP BY result.
    const byType = Object.fromEntries(ASSET_TYPES.map(t => [t, 0])) as DashboardCounts['byType'];
    let total = 0;
    for (const row of countsByType) {
      const n = Number(row.count);
      byType[row.type] = n;
      total += n;
    }

    const pinnedCount = Number(pinnedCountResult[0]?.count ?? 0);

    const counts: DashboardCounts = { total, byType, pinnedCount };

    return c.json({ pinnedAssets, pinnedCollections, recentAssets, counts });
  });
