import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createStartupReport,
  logStartupReportOnce,
  parseDatabaseUrl,
  resetStartupReportStateForTests,
} from './startup-report';

describe('parseDatabaseUrl', () => {
  test('returns safe database details without credentials', () => {
    expect(
      parseDatabaseUrl('postgresql://cellar:supersecret@localhost:5432/cellar?schema=public')
    ).toEqual('postgresql host=localhost port=5432 db=cellar');
  });

  test('returns present (unparseable) for invalid URLs', () => {
    expect(parseDatabaseUrl('definitely not a url')).toBe('present (unparseable)');
  });

  test('returns missing when DATABASE_URL is absent', () => {
    expect(parseDatabaseUrl(undefined)).toBe('missing');
  });
});

describe('createStartupReport', () => {
  test('renders grouped startup diagnostics with masked secrets', () => {
    const report = createStartupReport({
      NODE_ENV: 'development',
      PORT: '3001',
      E2E_TEST_MODE: 'true',
      DATABASE_URL: 'postgresql://cellar:supersecret@db.internal:5432/cellar',
      BETTER_AUTH_URL: 'http://localhost:3001',
      BETTER_AUTH_TRUSTED_ORIGINS: 'http://localhost:3001, https://cellar.example.com',
      BETTER_AUTH_SECRET: 'super-secret-value-12345',
      GITHUB_CLIENT_ID: 'github-client-id-12345',
      GITHUB_CLIENT_SECRET: 'github-client-secret-12345',
      UPLOAD_DIR: './uploads',
      MAX_FILE_SIZE: '10485760',
    });

    expect(report).toContain('[cellar] Startup configuration');
    expect(report).toContain('Runtime');
    expect(report).toContain('Database');
    expect(report).toContain('Auth');
    expect(report).toContain('Uploads');
    expect(report).toContain('NODE_ENV: development');
    expect(report).toContain('PORT: 3001');
    expect(report).toContain('E2E_TEST_MODE: true');
    expect(report).toContain('DATABASE_URL: postgresql host=db.internal port=5432 db=cellar');
    expect(report).toContain(
      'BETTER_AUTH_TRUSTED_ORIGINS: 2 origins [http://localhost:3001, https://cellar.example.com]'
    );
    expect(report).toContain('BETTER_AUTH_SECRET:');
    expect(report).toContain('(length 24, sha256:');
    expect(report).toContain('MAX_FILE_SIZE: 10485760');
    expect(report).not.toContain('supersecret');
    expect(report).not.toContain('super-secret-value-12345');
    expect(report).not.toContain('github-client-secret-12345');
  });

  test('falls back to readable defaults for missing and invalid values', () => {
    const report = createStartupReport({
      NODE_ENV: 'production',
      DATABASE_URL: 'not a valid url',
      BETTER_AUTH_URL: '',
      BETTER_AUTH_TRUSTED_ORIGINS: '%%%bad%%%',
      BETTER_AUTH_SECRET: 'tiny',
      GITHUB_CLIENT_ID: '',
      GITHUB_CLIENT_SECRET: undefined,
      UPLOAD_DIR: '',
      MAX_FILE_SIZE: '',
    });

    expect(report).toContain('PORT: default (3000)');
    expect(report).toContain('DATABASE_URL: present (unparseable)');
    expect(report).toContain('BETTER_AUTH_TRUSTED_ORIGINS: present (unparseable)');
    expect(report).toContain('GITHUB_CLIENT_ID: missing');
    expect(report).toContain('GITHUB_CLIENT_SECRET: missing');
    expect(report).toContain('UPLOAD_DIR: missing');
    expect(report).toContain('MAX_FILE_SIZE: missing');
    expect(report).not.toContain('tiny');
  });
});

describe('logStartupReportOnce', () => {
  beforeEach(() => {
    resetStartupReportStateForTests();
  });

  test('logs only once per server instance', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    logStartupReportOnce({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://cellar:secret@localhost:5432/cellar',
    });
    logStartupReportOnce({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://cellar:secret@localhost:5432/cellar',
    });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0]?.[0]).toContain('[cellar] Startup configuration');
  });
});
