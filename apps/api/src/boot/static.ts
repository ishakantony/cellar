import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

/**
 * In production, the Hono app serves the built SPA from `apps/shell/dist`.
 * Mounted only when `WEB_DIST_DIR` is set or the default path exists.
 */
export function mountStaticSpa(app: Hono) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    process.env.WEB_DIST_DIR,
    path.resolve(dirname, '../../shell/dist'),
    path.resolve(dirname, '../../../shell/dist'),
    path.resolve(process.cwd(), 'shell/dist'),
    path.resolve(process.cwd(), '../shell/dist'),
  ].filter((p): p is string => typeof p === 'string' && p.length > 0);

  const root = candidates.find(candidate => existsSync(path.join(candidate, 'index.html')));
  if (!root) {
    console.info('[cellar] no built shell/dist found — running in API-only mode');
    return;
  }

  console.info(`[cellar] serving SPA from ${root}`);

  app.use('/*', serveStatic({ root, index: 'index.html' }));

  // SPA fallback for any non-API GET that doesn't map to a file.
  const indexHtml = readFileSync(path.join(root, 'index.html'), 'utf8');
  app.notFound(c => {
    if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/.well-known/')) {
      return c.json({ error: 'Not found' }, 404);
    }
    return c.html(indexHtml);
  });
}
