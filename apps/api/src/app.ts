import { Hono } from 'hono';
import { auth } from './auth/auth';
import { assetsRoute } from './routes/assets';
import { collectionsRoute } from './routes/collections';
import { dashboardRoute } from './routes/dashboard';
import { filesRoute } from './routes/files';
import { settingsRoute } from './routes/settings';
import { uploadRoute } from './routes/upload';

const authHandler = (c: { req: { raw: Request } }) => auth.handler(c.req.raw);

export function buildApp() {
  return new Hono()
    .on(['GET', 'POST'], '/api/auth/*', c => authHandler(c))
    .on(['GET', 'POST'], '/.well-known/*', c => authHandler(c))
    .route('/api/assets', assetsRoute)
    .route('/api/collections', collectionsRoute)
    .route('/api/dashboard', dashboardRoute)
    .route('/api/upload', uploadRoute)
    .route('/api/files', filesRoute)
    .route('/api/settings', settingsRoute)
    .get('/api/health', c => c.json({ ok: true }));
}

export const app = buildApp();

export type AppType = typeof app;
