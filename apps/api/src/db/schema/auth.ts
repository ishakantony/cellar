import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { cuid, ts } from './_helpers';

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

export type UserRow = typeof user.$inferSelect;
