/**
 * Schema barrel: re-exports every table, enum, relation, and helper from the
 * auth/oauth/vault slices, plus the unified `schema` object passed to Drizzle
 * and Better Auth. Cross-slice relations (e.g. user → assets) live here
 * because they reference tables in multiple slices.
 */

import { relations } from 'drizzle-orm';
import { account, session, user, verification } from './auth';
import { asset, assetCollection, collection } from './vault';

export * from './auth';
export * from './oauth';
export * from './vault';

// User relation block — references both auth-slice (sessions/accounts) and
// vault-slice (assets/collections) tables, so it must live in the barrel.
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  assets: many(asset),
  collections: many(collection),
}));

import { oAuthAccessToken, oAuthClient, oAuthConsent, oAuthRefreshToken, jwks } from './oauth';
import { assetCollectionRelations, assetRelations, collectionRelations } from './vault';

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
