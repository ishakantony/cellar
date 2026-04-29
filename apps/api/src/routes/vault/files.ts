import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Hono } from 'hono';
import { CONTENT_TYPES, INLINE_UNSAFE_EXTENSIONS } from '../../lib/file-validation';
import { requireUser, type AuthVariables } from '../../lib/session-middleware';

export const filesRoute = new Hono<{ Variables: AuthVariables }>()
  .use(requireUser)
  .get('/*', async c => {
    const user = c.get('user');
    // Path is everything after /api/vault/files/
    const filePath = c.req.path.replace(/^\/api\/vault\/files\//, '');

    if (!filePath.startsWith(user.id + '/')) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const uploadsRoot = join(process.cwd(), uploadDir);
    const fullPath = join(uploadsRoot, filePath);

    if (!fullPath.startsWith(uploadsRoot + '/') && fullPath !== uploadsRoot) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    try {
      const fileStat = await stat(fullPath);
      if (!fileStat.isFile()) {
        return c.json({ error: 'Not found' }, 404);
      }

      const buffer = await readFile(fullPath);
      const ext = fullPath.split('.').pop()?.toLowerCase() ?? '';
      const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
      const isInlineUnsafe = INLINE_UNSAFE_EXTENSIONS.has(ext);

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'private, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      };
      if (isInlineUnsafe) {
        headers['Content-Disposition'] = 'attachment';
      }

      return c.body(new Uint8Array(buffer), 200, headers);
    } catch {
      return c.json({ error: 'Not found' }, 404);
    }
  });
