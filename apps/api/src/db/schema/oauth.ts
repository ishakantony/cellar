import { sql } from 'drizzle-orm';
import { boolean, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { cuid, ts } from './_helpers';
import { user } from './auth';

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
