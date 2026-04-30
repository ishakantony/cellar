import 'dotenv/config';
import { config } from 'dotenv';
import { execSync } from 'node:child_process';
import { Client } from 'pg';
import path from 'node:path';

config({ path: path.resolve(process.cwd(), '.env.test'), override: true });

async function setupTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is required');
    console.error('Make sure .env.test exists and contains DATABASE_URL');
    process.exit(1);
  }

  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1);
  const baseUrl = `${url.protocol}//${url.username}:${url.password}@${url.host}`;

  console.log(`Setting up test database: ${dbName}`);
  const client = new Client({ connectionString: baseUrl });

  try {
    await client.connect();
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (result.rowCount === 0) {
      console.log(`Creating database: ${dbName}...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
    await client.end();

    console.log('Running Drizzle migrations...');
    execSync('bun run --filter api src/boot/migrate.ts', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    });

    console.log('✅ Test database setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  }
}

setupTestDatabase();
