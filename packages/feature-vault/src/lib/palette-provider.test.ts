import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vaultPaletteProvider } from './palette-provider';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: 'asset-1',
    userId: 'user-1',
    type: 'SNIPPET',
    title: 'My Snippet',
    description: null,
    pinned: false,
    content: null,
    language: null,
    url: null,
    filePath: null,
    fileName: null,
    mimeType: null,
    fileSize: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeCollection(overrides: Record<string, unknown> = {}) {
  return {
    id: 'col-1',
    userId: 'user-1',
    name: 'My Collection',
    description: null,
    color: null,
    pinned: false,
    assetCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Fetch mock setup
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetchResponse(data: unknown, headers: Record<string, string> = {}) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// vaultPaletteProvider.search
// ---------------------------------------------------------------------------

describe('vaultPaletteProvider.search', () => {
  it('returns empty array for empty query', async () => {
    const ctrl = new AbortController();
    const result = await vaultPaletteProvider.search('', ctrl.signal);
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns empty array for whitespace-only query', async () => {
    const ctrl = new AbortController();
    const result = await vaultPaletteProvider.search('   ', ctrl.signal);
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns asset items correctly shaped', async () => {
    const asset = makeAsset({ id: 'a1', title: 'React Hooks Snippet', type: 'SNIPPET' });
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([asset])) // assets
      .mockResolvedValueOnce(mockFetchResponse([])); // collections

    const ctrl = new AbortController();
    const result = await vaultPaletteProvider.search('react', ctrl.signal);

    const assetItem = result.find(r => r.id === 'vault-asset-a1');
    expect(assetItem).toBeDefined();
    expect(assetItem?.label).toBe('React Hooks Snippet');
    expect(assetItem?.group).toBe('Assets');
    expect(assetItem?.href).toBe('/vault/assets/a1');
    expect(assetItem?.description).toBe('Snippet');
    expect(assetItem?.icon).toBeDefined();
  });

  it('returns collection items correctly shaped', async () => {
    const collection = makeCollection({ id: 'c1', name: 'React Resources' });
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([])) // assets
      .mockResolvedValueOnce(mockFetchResponse([collection])); // collections

    const ctrl = new AbortController();
    const result = await vaultPaletteProvider.search('react', ctrl.signal);

    const colItem = result.find(r => r.id === 'vault-collection-c1');
    expect(colItem).toBeDefined();
    expect(colItem?.label).toBe('React Resources');
    expect(colItem?.group).toBe('Collections');
    expect(colItem?.href).toBe('/vault/collections/c1');
    expect(colItem?.icon).toBeDefined();
  });

  it('filters collections client-side by query', async () => {
    const collections = [
      makeCollection({ id: 'c1', name: 'React Snippets' }),
      makeCollection({ id: 'c2', name: 'Vue Notes' }),
      makeCollection({ id: 'c3', name: 'Angular Templates' }),
    ];
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([])) // assets
      .mockResolvedValueOnce(mockFetchResponse(collections)); // all collections

    const ctrl = new AbortController();
    const result = await vaultPaletteProvider.search('react', ctrl.signal);

    const collectionItems = result.filter(r => r.group === 'Collections');
    expect(collectionItems).toHaveLength(1);
    expect(collectionItems[0]?.label).toBe('React Snippets');
  });

  it('returns assets before collections in results', async () => {
    const asset = makeAsset({ id: 'a1', title: 'My Asset' });
    const collection = makeCollection({ id: 'c1', name: 'My Collection' });
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([asset]))
      .mockResolvedValueOnce(mockFetchResponse([collection]));

    const ctrl = new AbortController();
    const result = await vaultPaletteProvider.search('my', ctrl.signal);

    const assetIdx = result.findIndex(r => r.group === 'Assets');
    const collectionIdx = result.findIndex(r => r.group === 'Collections');
    expect(assetIdx).toBeLessThan(collectionIdx);
  });

  it('respects the abort signal — passes signal to fetch', async () => {
    // Mock fetch to reject with an AbortError (mimicking browser behavior)
    mockFetch.mockImplementation((_url: string, init: RequestInit) => {
      if (init?.signal?.aborted) {
        return Promise.reject(new DOMException('Aborted', 'AbortError'));
      }
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });

    const ctrl = new AbortController();
    ctrl.abort();

    await expect(vaultPaletteProvider.search('test', ctrl.signal)).rejects.toBeDefined();
    // fetch should have been called with the signal
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/vault/assets'),
      expect.objectContaining({ signal: ctrl.signal })
    );
  });

  it('caps asset results at 5', async () => {
    const assets = Array.from({ length: 8 }, (_, i) =>
      makeAsset({ id: `a${i}`, title: `Asset ${i}` })
    );
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse(assets))
      .mockResolvedValueOnce(mockFetchResponse([]));

    const ctrl = new AbortController();
    const result = await vaultPaletteProvider.search('asset', ctrl.signal);
    const assetItems = result.filter(r => r.group === 'Assets');
    expect(assetItems.length).toBeLessThanOrEqual(5);
  });

  it('assigns correct icon for each asset type', async () => {
    const types = ['SNIPPET', 'PROMPT', 'NOTE', 'LINK', 'IMAGE', 'FILE'] as const;

    for (const type of types) {
      const asset = makeAsset({ id: `a-${type}`, title: `Asset`, type });
      mockFetch
        .mockResolvedValueOnce(mockFetchResponse([asset]))
        .mockResolvedValueOnce(mockFetchResponse([]));

      const ctrl = new AbortController();
      const result = await vaultPaletteProvider.search('asset', ctrl.signal);
      const item = result.find(r => r.id === `vault-asset-a-${type}`);
      expect(item?.icon, `icon for ${type}`).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// vaultPaletteProvider.getRecent
// ---------------------------------------------------------------------------

describe('vaultPaletteProvider.getRecent', () => {
  it('returns recent assets in the "Recent" group', async () => {
    const assets = [
      makeAsset({ id: 'r1', title: 'Recent One' }),
      makeAsset({ id: 'r2', title: 'Recent Two' }),
    ];
    mockFetch.mockResolvedValueOnce(mockFetchResponse(assets));

    const result = await vaultPaletteProvider.getRecent!();

    expect(result).toHaveLength(2);
    expect(result[0]?.group).toBe('Recent');
    expect(result[1]?.group).toBe('Recent');
  });

  it('maps asset id to palette item id correctly', async () => {
    const asset = makeAsset({ id: 'myasset', title: 'My Asset' });
    mockFetch.mockResolvedValueOnce(mockFetchResponse([asset]));

    const result = await vaultPaletteProvider.getRecent!();
    expect(result[0]?.id).toBe('vault-asset-myasset');
  });

  it('sets href to /vault/assets/:id', async () => {
    const asset = makeAsset({ id: 'abc123' });
    mockFetch.mockResolvedValueOnce(mockFetchResponse([asset]));

    const result = await vaultPaletteProvider.getRecent!();
    expect(result[0]?.href).toBe('/vault/assets/abc123');
  });

  it('fetches from /api/vault/assets with sort=newest and limit=8', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse([]));

    await vaultPaletteProvider.getRecent!();

    // getRecent makes exactly one call; it's the last call in this test
    const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
    const url: string = lastCall?.[0] ?? '';
    expect(url).toContain('/api/vault/assets');
    expect(url).toContain('sort=newest');
    expect(url).toContain('limit=8');
  });

  it('returns empty array when API returns no assets', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse([]));

    const result = await vaultPaletteProvider.getRecent!();
    expect(result).toEqual([]);
  });
});
