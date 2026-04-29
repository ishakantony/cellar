import { Hono } from 'hono';
import { auth } from './auth/auth';
import { assetsRoute } from './routes/vault/assets';
import { collectionsRoute } from './routes/vault/collections';
import { dashboardRoute } from './routes/vault/dashboard';
import { filesRoute } from './routes/vault/files';
import { uploadRoute } from './routes/vault/upload';
import { settingsRoute } from './routes/account/settings';

const authHandler = (c: { req: { raw: Request } }) => auth.handler(c.req.raw);

export function buildApp() {
  return new Hono()
    .on(['GET', 'POST'], '/api/auth/*', c => authHandler(c))
    .on(['GET', 'POST'], '/.well-known/*', c => authHandler(c))
    .route('/api/vault/assets', assetsRoute)
    .route('/api/vault/collections', collectionsRoute)
    .route('/api/vault/dashboard', dashboardRoute)
    .route('/api/vault/upload', uploadRoute)
    .route('/api/vault/files', filesRoute)
    .route('/api/account/settings', settingsRoute)
    .get('/api/health', c => c.json({ ok: true }));
}

export const app = buildApp();

export type AppType = typeof app;
