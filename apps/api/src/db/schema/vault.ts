import { relations, sql } from 'drizzle-orm';
import { boolean, index, integer, pgEnum, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { ASSET_TYPES } from '@cellar/shared';
import { cuid, ts, tsvector } from './_helpers';
import { user } from './auth';

export const assetTypeEnum = pgEnum('AssetType', ASSET_TYPES);

export const asset = pgTable(
  'asset',
  {
    id: cuid(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: assetTypeEnum('type').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    pinned: boolean('pinned').notNull().default(false),
    content: text('content'),
    language: text('language'),
    url: text('url'),
    filePath: text('filePath'),
    fileName: text('fileName'),
    mimeType: text('mimeType'),
    fileSize: integer('fileSize'),
    createdAt: ts('createdAt').notNull().defaultNow(),
    updatedAt: ts('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    searchVector: tsvector('searchVector').generatedAlwaysAs(
      sql`to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))`
    ),
  },
  t => [
    index('asset_user_type_idx').on(t.userId, t.type),
    index('asset_user_pinned_idx').on(t.userId, t.pinned),
    index('asset_user_updated_at_idx').on(t.userId, t.updatedAt.desc()),
    index('asset_search_vector_idx').using('gin', t.searchVector),
  ]
);

export const collection = pgTable(
  'collection',
  {
    id: cuid(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    color: text('color'),
    pinned: boolean('pinned').notNull().default(false),
    createdAt: ts('createdAt').notNull().defaultNow(),
    updatedAt: ts('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  t => [index('collection_user_pinned_idx').on(t.userId, t.pinned)]
);

export const assetCollection = pgTable(
  'assetCollection',
  {
    assetId: text('assetId')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),
    collectionId: text('collectionId')
      .notNull()
      .references(() => collection.id, { onDelete: 'cascade' }),
  },
  t => [primaryKey({ columns: [t.assetId, t.collectionId] })]
);

// Relations used by the relational query API. The user-side relation
// (sessions/accounts/assets/collections) lives in the barrel because it
// references tables across both the auth and vault slices.
export const assetRelations = relations(asset, ({ one, many }) => ({
  user: one(user, { fields: [asset.userId], references: [user.id] }),
  collections: many(assetCollection),
}));

export const collectionRelations = relations(collection, ({ one, many }) => ({
  user: one(user, { fields: [collection.userId], references: [user.id] }),
  assets: many(assetCollection),
}));

export const assetCollectionRelations = relations(assetCollection, ({ one }) => ({
  asset: one(asset, { fields: [assetCollection.assetId], references: [asset.id] }),
  collection: one(collection, {
    fields: [assetCollection.collectionId],
    references: [collection.id],
  }),
}));

// Public select shape that excludes the `searchVector` tsvector column.
export const assetPublicColumns = {
  id: asset.id,
  userId: asset.userId,
  type: asset.type,
  title: asset.title,
  description: asset.description,
  pinned: asset.pinned,
  content: asset.content,
  language: asset.language,
  url: asset.url,
  filePath: asset.filePath,
  fileName: asset.fileName,
  mimeType: asset.mimeType,
  fileSize: asset.fileSize,
  createdAt: asset.createdAt,
  updatedAt: asset.updatedAt,
} as const;

export type AssetRow = typeof asset.$inferSelect;
export type CollectionRow = typeof collection.$inferSelect;
