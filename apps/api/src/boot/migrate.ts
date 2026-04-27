import 'dotenv/config';
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
  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}

const isMain =
  typeof import.meta.url === 'string' &&
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  runMigrations()
    .then(() => {
      console.info('[cellar] migrations applied');
      process.exit(0);
    })
    .catch(error => {
      console.error('[cellar] migration failed:', error);
      process.exit(1);
    });
}
