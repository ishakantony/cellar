import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { ASSET_TYPES } from '@cellar/shared';

const tsvector = customType<{ data: string; notNull: false }>({
  dataType() {
    return 'tsvector';
  },
});

export const assetTypeEnum = pgEnum('AssetType', ASSET_TYPES);

const cuid = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => createId());

const ts = (name: string) => timestamp(name, { precision: 3, mode: 'date', withTimezone: false });

export const user = pgTable('user', {
  id: cuid(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: ts('createdAt').notNull().defaultNow(),
  updatedAt: ts('updatedAt')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable('session', {
  id: cuid(),
  expiresAt: ts('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: ts('createdAt').notNull().defaultNow(),
  updatedAt: ts('updatedAt')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: cuid(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: ts('accessTokenExpiresAt'),
  refreshTokenExpiresAt: ts('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: ts('createdAt').notNull().defaultNow(),
  updatedAt: ts('updatedAt')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const verification = pgTable('verification', {
  id: cuid(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: ts('expiresAt').notNull(),
  createdAt: ts('createdAt').defaultNow(),
  updatedAt: ts('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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

export const oAuthClient = pgTable(
  'oAuthClient',
  {
    id: cuid(),
    clientId: text('clientId').notNull().unique(),
    clientSecret: text('clientSecret'),
    name: text('name'),
    icon: text('icon'),
    metadata: jsonb('metadata'),
    redirectUris: text('redirectUris')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    postLogoutRedirectUris: text('postLogoutRedirectUris')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    type: text('type'),
    disabled: boolean('disabled').notNull().default(false),
    skipConsent: boolean('skipConsent'),
    enableEndSession: boolean('enableEndSession'),
    subjectType: text('subjectType'),
    scopes: text('scopes')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
    createdAt: ts('createdAt').notNull().defaultNow(),
    updatedAt: ts('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    uri: text('uri'),
    contacts: text('contacts')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    tos: text('tos'),
    policy: text('policy'),
    softwareId: text('softwareId'),
    softwareVersion: text('softwareVersion'),
    softwareStatement: text('softwareStatement'),
    tokenEndpointAuthMethod: text('tokenEndpointAuthMethod'),
    grantTypes: text('grantTypes')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    responseTypes: text('responseTypes')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    public: boolean('public'),
    requirePKCE: boolean('requirePKCE'),
    referenceId: text('referenceId'),
  },
  t => [index('oauth_client_user_id_idx').on(t.userId)]
);

export const oAuthAccessToken = pgTable(
  'oAuthAccessToken',
  {
    id: cuid(),
    token: text('token').notNull().unique(),
    clientId: text('clientId')
      .notNull()
      .references(() => oAuthClient.clientId, { onDelete: 'cascade' }),
    sessionId: text('sessionId'),
    userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text('referenceId'),
    refreshId: text('refreshId'),
    scopes: text('scopes')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    expiresAt: ts('expiresAt').notNull(),
    createdAt: ts('createdAt').notNull().defaultNow(),
  },
  t => [
    index('oauth_access_token_client_id_idx').on(t.clientId),
    index('oauth_access_token_user_id_idx').on(t.userId),
  ]
);

export const oAuthRefreshToken = pgTable(
  'oAuthRefreshToken',
  {
    id: cuid(),
    token: text('token').notNull(),
    clientId: text('clientId').notNull(),
    sessionId: text('sessionId'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text('referenceId'),
    scopes: text('scopes')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    expiresAt: ts('expiresAt').notNull(),
    createdAt: ts('createdAt').notNull().defaultNow(),
    revoked: ts('revoked'),
  },
  t => [
    index('oauth_refresh_token_client_id_idx').on(t.clientId),
    index('oauth_refresh_token_user_id_idx').on(t.userId),
  ]
);

export const oAuthConsent = pgTable(
  'oAuthConsent',
  {
    id: cuid(),
    clientId: text('clientId')
      .notNull()
      .references(() => oAuthClient.clientId, { onDelete: 'cascade' }),
    userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),
    referenceId: text('referenceId'),
    scopes: text('scopes')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    createdAt: ts('createdAt').notNull().defaultNow(),
    updatedAt: ts('updatedAt')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  t => [
    index('oauth_consent_client_id_idx').on(t.clientId),
    index('oauth_consent_user_id_idx').on(t.userId),
  ]
);

export const jwks = pgTable('jwks', {
  id: cuid(),
  publicKey: text('publicKey').notNull(),
  privateKey: text('privateKey').notNull(),
  createdAt: ts('createdAt').notNull().defaultNow(),
  expiresAt: ts('expiresAt'),
});

// Relations used by the relational query API
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  assets: many(asset),
  collections: many(collection),
}));

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

export const schema = {
  user,
  session,
  account,
  verification,
  asset,
  collection,
  assetCollection,
  oAuthClient,
  oAuthAccessToken,
  oAuthRefreshToken,
  oAuthConsent,
  jwks,
  userRelations,
  assetRelations,
  collectionRelations,
  assetCollectionRelations,
};

export type Schema = typeof schema;
export type AssetRow = typeof asset.$inferSelect;
export type CollectionRow = typeof collection.$inferSelect;
export type UserRow = typeof user.$inferSelect;
