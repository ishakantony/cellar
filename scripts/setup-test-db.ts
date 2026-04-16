import 'dotenv/config';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { Client } from 'pg';
import path from 'path';

// Explicitly load .env.test, overriding any existing values
config({ path: path.resolve(process.cwd(), '.env.test'), override: true });

async function setupTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is required');
    console.error('Make sure .env.test exists and contains DATABASE_URL');
    process.exit(1);
  }

  // Parse the connection URL to get base connection (without database name)
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1); // Remove leading slash
  const baseUrl = `${url.protocol}//${url.username}:${url.password}@${url.host}`;
  
  console.log(`Setting up test database: ${dbName}`);
  console.log(`Base connection: ${baseUrl}`);

  const client = new Client({ connectionString: baseUrl });
  
  try {
    await client.connect();
    
    // Check if test database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (result.rowCount === 0) {
      console.log(`Creating database: ${dbName}...`);
      // PostgreSQL doesn't allow parameterized queries for CREATE DATABASE
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
    
    await client.end();
    
    // Run Prisma migrations on test database
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy', {
      env: process.env,
      stdio: 'inherit',
    });
    
    console.log('✅ Test database setup complete!');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  }
}

setupTestDatabase();
