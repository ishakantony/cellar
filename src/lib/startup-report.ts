import { createHash } from 'node:crypto';

type StartupEnv = Partial<Record<string, string | undefined>>;

const DEFAULT_PORT = '3000';
const PREVIEW_CHARS = 4;

let hasLoggedStartupReport = false;

function readEnvValue(env: StartupEnv, key: string): string | undefined {
  const value = env[key];
  if (value == null) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function maskSecret(value: string | undefined): string {
  if (!value) {
    return 'missing';
  }

  const fingerprint = createHash('sha256').update(value).digest('hex').slice(0, 8);

  if (value.length <= PREVIEW_CHARS * 2) {
    return `[masked] (length ${value.length}, sha256:${fingerprint})`;
  }

  const prefix = value.slice(0, PREVIEW_CHARS);
  const suffix = value.slice(-PREVIEW_CHARS);
  return `${prefix}...${suffix} (length ${value.length}, sha256:${fingerprint})`;
}

export function parseDatabaseUrl(value: string | undefined): string {
  if (!value) {
    return 'missing';
  }

  try {
    const url = new URL(value);
    const provider = url.protocol.replace(':', '') || 'unknown';
    const host = url.hostname || 'unknown';
    const port = url.port || 'default';
    const databaseName = url.pathname.replace(/^\//, '') || 'unknown';

    return `${provider} host=${host} port=${port} db=${databaseName}`;
  } catch {
    return 'present (unparseable)';
  }
}

function parseTrustedOrigins(value: string | undefined): string {
  if (!value) {
    return 'missing';
  }

  const candidates = value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  if (candidates.length === 0) {
    return 'missing';
  }

  try {
    const origins = candidates
      .map(origin => new URL(origin).origin)
      .sort((a, b) => a.localeCompare(b));
    return `${origins.length} origins [${origins.join(', ')}]`;
  } catch {
    return 'present (unparseable)';
  }
}

function linesForSection(title: string, entries: Array<[string, string]>): string[] {
  return [title, ...entries.map(([label, rendered]) => `  ${label}: ${rendered}`)];
}

export function createStartupReport(env: StartupEnv = process.env): string {
  const runtimeLines = linesForSection('Runtime', [
    ['NODE_ENV', readEnvValue(env, 'NODE_ENV') ?? 'unknown'],
    ['PORT', readEnvValue(env, 'PORT') ?? `default (${DEFAULT_PORT})`],
    ['E2E_TEST_MODE', readEnvValue(env, 'E2E_TEST_MODE') ?? 'false'],
  ]);

  const databaseLines = linesForSection('Database', [
    ['DATABASE_URL', parseDatabaseUrl(readEnvValue(env, 'DATABASE_URL'))],
  ]);

  const authLines = linesForSection('Auth', [
    ['BETTER_AUTH_URL', readEnvValue(env, 'BETTER_AUTH_URL') ?? 'missing'],
    [
      'BETTER_AUTH_TRUSTED_ORIGINS',
      parseTrustedOrigins(readEnvValue(env, 'BETTER_AUTH_TRUSTED_ORIGINS')),
    ],
    ['BETTER_AUTH_SECRET', maskSecret(readEnvValue(env, 'BETTER_AUTH_SECRET'))],
    ['GITHUB_CLIENT_ID', maskSecret(readEnvValue(env, 'GITHUB_CLIENT_ID'))],
    ['GITHUB_CLIENT_SECRET', maskSecret(readEnvValue(env, 'GITHUB_CLIENT_SECRET'))],
  ]);

  const uploadLines = linesForSection('Uploads', [
    ['UPLOAD_DIR', readEnvValue(env, 'UPLOAD_DIR') ?? 'missing'],
    ['MAX_FILE_SIZE', readEnvValue(env, 'MAX_FILE_SIZE') ?? 'missing'],
  ]);

  return [
    '[cellar] Startup configuration',
    ...runtimeLines.map(line => `  ${line}`),
    ...databaseLines.map(line => `  ${line}`),
    ...authLines.map(line => `  ${line}`),
    ...uploadLines.map(line => `  ${line}`),
  ].join('\n');
}

export function logStartupReportOnce(env: StartupEnv = process.env): void {
  if (hasLoggedStartupReport) {
    return;
  }

  hasLoggedStartupReport = true;
  console.info(createStartupReport(env));
}

export function resetStartupReportStateForTests(): void {
  hasLoggedStartupReport = false;
}
