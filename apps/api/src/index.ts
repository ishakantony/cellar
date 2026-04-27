import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './app';
import { runMigrations } from './boot/migrate';
import { seedIfEmpty } from './boot/seed';
import { syncFirstPartyClients } from './auth/oidc/sync-clients';
import { logStartupReportOnce } from './boot/startup-report';
import { mountStaticSpa } from './boot/static';
import { firstPartyClients } from './auth/oidc/first-party-clients';

async function bootstrap() {
  await runMigrations();

  const seedResult = await seedIfEmpty();
  if (seedResult.seeded) {
    console.info('[cellar] seeded demo user demo@cellar.app / password123');
  }

  // Only sync OIDC clients when their secrets are present in the environment.
  const allSecretsPresent = firstPartyClients.every(c => process.env[c.secretEnvVar]);
  if (allSecretsPresent) {
    const sync = await syncFirstPartyClients({
      disableMissing: process.env.OIDC_DISABLE_MISSING_CLIENTS === 'true',
    });
    console.info(
      `[cellar] OIDC clients synced: ${sync.synced.join(', ') || 'none'} (disabled ${sync.disabled})`
    );
  } else {
    console.info('[cellar] skipping OIDC client sync — secrets not configured');
  }

  logStartupReportOnce();

  if (process.env.NODE_ENV === 'production') {
    mountStaticSpa(app);
  }

  const port = Number(process.env.PORT ?? 5201);
  serve(
    {
      fetch: app.fetch,
      port,
      hostname: '0.0.0.0',
    },
    info => {
      console.info(`[cellar] listening on http://${info.address}:${info.port}`);
    }
  );
}

bootstrap().catch(error => {
  console.error('[cellar] bootstrap failed:', error);
  process.exit(1);
});
