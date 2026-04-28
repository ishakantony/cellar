import '../load-env';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(dirname, '../../drizzle');

export async function runMigrations(connectionString: string = process.env.DATABASE_URL ?? '') {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  const pool = new Pool({ connectionString, max: 1 });
  const db = drizzle(pool);
  const startedAt = Date.now();
  try {
    const before = await countAppliedMigrations(pool);
    await migrate(db, { migrationsFolder });
    const after = await countAppliedMigrations(pool);
    const applied = Math.max(0, after - before);
    const elapsed = Date.now() - startedAt;
    if (applied === 0) {
      console.info(`[cellar] migrations up to date (${after} applied, ${elapsed}ms)`);
    } else {
      console.info(`[cellar] migrations applied: ${applied} new (${after} total, ${elapsed}ms)`);
    }
  } catch (error) {
    console.error('[cellar] migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function countAppliedMigrations(pool: Pool): Promise<number> {
  try {
    const result = await pool.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM drizzle.__drizzle_migrations'
    );
    return Number(result.rows[0]?.count ?? 0);
  } catch {
    return 0;
  }
}

const isMain =
  typeof import.meta.url === 'string' &&
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
