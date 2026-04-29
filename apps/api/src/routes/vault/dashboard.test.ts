/**
 * Integration test for GET /api/vault/dashboard — counts field.
 *
 * Strategy: vi.mock the db client so no real Postgres connection is needed,
 * and stub requireUser to inject a fake authenticated user.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AuthVariables } from '../../lib/session-middleware';

// ---------------------------------------------------------------------------
// Mock the DB client before importing dashboard route (which imports db).
// ---------------------------------------------------------------------------

const mockSelect = vi.fn();
vi.mock('../../db/client', () => ({ db: { select: mockSelect } }));

// Mock session-middleware: replace requireUser with a middleware that injects
// a fixed user, and export AuthVariables type unchanged.
vi.mock('../../lib/session-middleware', () => ({
  requireUser: async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('user', { id: 'user-1', email: 'test@example.com', name: 'Test', emailVerified: true });
    await next();
  },
}));

// ---------------------------------------------------------------------------
// Build a minimal app that mounts the dashboard route AFTER mocks are set up.
// ---------------------------------------------------------------------------

const { dashboardRoute } = await import('./dashboard');

const app = new Hono<{ Variables: AuthVariables }>().route('/api/vault/dashboard', dashboardRoute);

// ---------------------------------------------------------------------------
// Helpers to build chainable Drizzle-mock call chains.
// The dashboard route does: db.select(...).from(...).where(...).orderBy(...).limit(...)
// or                        db.select(...).from(...).where(...).groupBy(...)
// ---------------------------------------------------------------------------

function makeChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ['from', 'where', 'leftJoin', 'orderBy', 'limit', 'groupBy'];
  for (const m of methods) {
    chain[m] = () => chain;
  }
  chain.then = (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve);
  // Make it a thenable so Drizzle queries (which return Promise-like) work.
  return chain;
}

describe('GET /api/vault/dashboard — counts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns counts.byType with correct values and zeros for missing types', async () => {
    // Five parallel queries are fired in this order:
    // 0: pinnedAssets
    // 1: pinnedCollections
    // 2: recentAssets
    // 3: countsByType (GROUP BY type)
    // 4: pinnedCount

    let callIndex = 0;
    mockSelect.mockImplementation(() => {
      const idx = callIndex++;
      const results: unknown[] = [
        [], // pinnedAssets
        [], // pinnedCollections
        [], // recentAssets
        [
          // countsByType
          { type: 'SNIPPET', count: '3' },
          { type: 'NOTE', count: '5' },
          { type: 'LINK', count: '1' },
        ],
        [{ count: '2' }], // pinnedCount
      ];
      return makeChain(results[idx]);
    });

    const res = await app.request('/api/vault/dashboard');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      counts: {
        total: number;
        byType: Record<string, number>;
        pinnedCount: number;
      };
    };

    expect(body.counts.total).toBe(9); // 3 + 5 + 1
    expect(body.counts.pinnedCount).toBe(2);

    // Supplied types should match seeded counts.
    expect(body.counts.byType.SNIPPET).toBe(3);
    expect(body.counts.byType.NOTE).toBe(5);
    expect(body.counts.byType.LINK).toBe(1);

    // Types with no assets should be zero — not omitted.
    expect(body.counts.byType.PROMPT).toBe(0);
    expect(body.counts.byType.IMAGE).toBe(0);
    expect(body.counts.byType.FILE).toBe(0);
  });

  test('returns counts with all zeros when user has no assets', async () => {
    let callIndex = 0;
    mockSelect.mockImplementation(() => {
      const idx = callIndex++;
      const results: unknown[] = [[], [], [], [], [{ count: '0' }]];
      return makeChain(results[idx]);
    });

    const res = await app.request('/api/vault/dashboard');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      counts: { total: number; byType: Record<string, number>; pinnedCount: number };
    };
    expect(body.counts.total).toBe(0);
    expect(body.counts.pinnedCount).toBe(0);
    for (const key of ['SNIPPET', 'PROMPT', 'NOTE', 'LINK', 'IMAGE', 'FILE']) {
      expect(body.counts.byType[key]).toBe(0);
    }
  });

  test('existing fields (pinnedAssets, pinnedCollections, recentAssets) are still present', async () => {
    let callIndex = 0;
    mockSelect.mockImplementation(() => {
      const idx = callIndex++;
      const results: unknown[] = [
        [{ id: 'a1', title: 'Pinned asset' }], // pinnedAssets
        [{ id: 'c1', name: 'Pinned coll' }], // pinnedCollections
        [{ id: 'a2', title: 'Recent asset' }], // recentAssets
        [], // countsByType
        [{ count: '1' }], // pinnedCount
      ];
      return makeChain(results[idx]);
    });

    const res = await app.request('/api/vault/dashboard');
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    expect(Array.isArray(body.pinnedAssets)).toBe(true);
    expect(Array.isArray(body.pinnedCollections)).toBe(true);
    expect(Array.isArray(body.recentAssets)).toBe(true);
    expect(body.counts).toBeDefined();
  });
});
