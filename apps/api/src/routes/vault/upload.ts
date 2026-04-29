import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Hono } from 'hono';
import { createId } from '@paralleldrive/cuid2';
import {
  ALLOWED_EXTENSIONS,
  validateFileContent,
  validateSvgContent,
} from '../../lib/file-validation';
import { requireUser, type AuthVariables } from '../../lib/session-middleware';

export const uploadRoute = new Hono<{ Variables: AuthVariables }>()
  .use(requireUser)
  .post('/', async c => {
    const user = c.get('user');
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);
    const uploadDir = process.env.UPLOAD_DIR || './uploads';

    let formData: FormData;
    try {
      formData = await c.req.raw.formData();
    } catch {
      return c.json({ error: 'Invalid form data' }, 400);
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (file.size > maxFileSize) {
      return c.json({ error: `File too large. Max size: ${maxFileSize / 1024 / 1024}MB` }, 413);
    }

    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return c.json({ error: `File type not allowed: ${ext || 'unknown'}` }, 415);
    }

    const userDir = join(process.cwd(), uploadDir, user.id);
    const storedName = `${createId()}${ext}`;
    const storedPath = join(userDir, storedName);

    try {
      await mkdir(userDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());

      if (!validateFileContent(buffer, ext)) {
        return c.json({ error: 'File content does not match extension' }, 415);
      }

      if (ext === '.svg') {
        const svgValidation = validateSvgContent(buffer);
        if (!svgValidation.valid) {
          return c.json({ error: svgValidation.error ?? 'Invalid SVG' }, 415);
        }
      }

      await writeFile(storedPath, buffer);
    } catch {
      return c.json({ error: 'Upload failed' }, 500);
    }

    const relativePath = `${user.id}/${storedName}`;

    return c.json({
      filePath: relativePath,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });
  });
