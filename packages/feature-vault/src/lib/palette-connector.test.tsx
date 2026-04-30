import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { VaultPaletteConnector } from './palette-connector';
import type { PaletteResultGroup } from '@cellar/shell-contract';

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

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetchResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  };
}

function lastCall(onResults: ReturnType<typeof vi.fn>): PaletteResultGroup[] {
  const calls = onResults.mock.calls;
  return calls[calls.length - 1]?.[0] as PaletteResultGroup[];
}

// ---------------------------------------------------------------------------
// Search mode (non-empty query)
// ---------------------------------------------------------------------------

describe('VaultPaletteConnector — search mode', () => {
  it('reports two groups: vault-assets and vault-collections', async () => {
    const asset = makeAsset({ id: 'a1', title: 'React Hooks', type: 'SNIPPET' });
    const collection = makeCollection({ id: 'c1', name: 'React Patterns' });
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([asset])) // assets
      .mockResolvedValueOnce(mockFetchResponse([collection])); // collections

    const onResults = vi.fn();
    const { unmount } = render(<VaultPaletteConnector query="react" onResults={onResults} />, {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      const groups = lastCall(onResults);
      expect(groups.some(g => g.isPending === false && g.id === 'vault-assets')).toBe(true);
      expect(groups.some(g => g.isPending === false && g.id === 'vault-collections')).toBe(true);
    });

    unmount();
  });

  it('assets group is pending while assets are in flight, collections resolve independently', async () => {
    // Collections resolve fast, assets are slow
    let resolveAssets!: (v: unknown) => void;
    const assetsPromise = new Promise(r => {
      resolveAssets = r;
    });

    mockFetch
      .mockImplementationOnce(() => assetsPromise.then(() => mockFetchResponse([]))) // assets — slow
      .mockResolvedValueOnce(mockFetchResponse([makeCollection({ name: 'React Patterns' })])); // collections — fast

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="react" onResults={onResults} />, {
      wrapper: makeWrapper(),
    });

    // Collections should resolve; assets still pending
    await waitFor(() => {
      const groups = lastCall(onResults);
      const assets = groups.find(g => g.id === 'vault-assets');
      const collections = groups.find(g => g.id === 'vault-collections');
      expect(assets?.isPending).toBe(true);
      expect(collections?.isPending).toBe(false);
      expect(collections?.items).toHaveLength(1);
    });

    resolveAssets(undefined);
  });

  it('asset items appear in vault-assets group, collection items in vault-collections group', async () => {
    const asset = makeAsset({ id: 'a1', title: 'My Asset', type: 'NOTE' });
    const collection = makeCollection({ id: 'c1', name: 'My Collection' });
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([asset]))
      .mockResolvedValueOnce(mockFetchResponse([collection]));

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="my" onResults={onResults} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      const groups = lastCall(onResults);
      const assetGroup = groups.find(g => g.id === 'vault-assets');
      const collectionGroup = groups.find(g => g.id === 'vault-collections');
      expect(assetGroup?.items.map(i => i.id)).toContain('vault-asset-a1');
      expect(collectionGroup?.items.map(i => i.id)).toContain('vault-collection-c1');
    });
  });

  it('collections are filtered client-side by name', async () => {
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([])) // assets
      .mockResolvedValueOnce(
        mockFetchResponse([
          makeCollection({ id: 'c1', name: 'React Patterns' }),
          makeCollection({ id: 'c2', name: 'Vue Components' }),
        ])
      );

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="react" onResults={onResults} />, {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      const groups = lastCall(onResults);
      const collectionGroup = groups.find(g => g.id === 'vault-collections');
      expect(collectionGroup?.items).toHaveLength(1);
      expect(collectionGroup?.items[0]?.id).toBe('vault-collection-c1');
    });
  });

  it('reports isError=true on the assets group when the assets fetch fails', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('network error')) // assets
      .mockResolvedValueOnce(mockFetchResponse([])); // collections

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="fail" onResults={onResults} />, {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      const groups = lastCall(onResults);
      const assetGroup = groups.find(g => g.id === 'vault-assets');
      expect(assetGroup?.isError).toBe(true);
      expect(assetGroup?.items).toEqual([]);
    });
  });
});

// ---------------------------------------------------------------------------
// Recents mode (empty query)
// ---------------------------------------------------------------------------

describe('VaultPaletteConnector — recents mode', () => {
  it('reports a single vault-recent group with recent assets', async () => {
    const asset = makeAsset({ id: 'r1', title: 'Recent One' });
    mockFetch.mockResolvedValueOnce(mockFetchResponse([asset]));

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="" onResults={onResults} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      const groups = lastCall(onResults);
      expect(groups).toHaveLength(1);
      const recent = groups[0]!;
      expect(recent.id).toBe('vault-recent');
      expect(recent.isPending).toBe(false);
      expect(recent.items).toHaveLength(1);
      expect(recent.items[0]?.id).toBe('vault-asset-r1');
    });
  });

  it('fetches from /api/vault/assets with sort=newest and limit=8', async () => {
    mockFetch.mockResolvedValueOnce(mockFetchResponse([]));

    render(<VaultPaletteConnector query="" onResults={vi.fn()} />, { wrapper: makeWrapper() });

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const url: string = mockFetch.mock.calls[0]?.[0] ?? '';
    expect(url).toContain('/api/vault/assets');
    expect(url).toContain('sort=newest');
    expect(url).toContain('limit=8');
  });
});
