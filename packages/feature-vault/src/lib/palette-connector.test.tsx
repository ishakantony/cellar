import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { VaultPaletteConnector } from './palette-connector';

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

// ---------------------------------------------------------------------------
// Search mode (non-empty query)
// ---------------------------------------------------------------------------

describe('VaultPaletteConnector — search mode', () => {
  it('reports isPending=true initially then items when query resolves', async () => {
    const asset = makeAsset({ id: 'a1', title: 'React Hooks', type: 'SNIPPET' });
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([asset])) // assets
      .mockResolvedValueOnce(mockFetchResponse([])); // collections

    const onResults = vi.fn();
    const { unmount } = render(<VaultPaletteConnector query="react" onResults={onResults} />, {
      wrapper: makeWrapper(),
    });

    // Initial call: isPending=true while query is in flight
    await waitFor(() =>
      expect(onResults).toHaveBeenCalledWith(expect.objectContaining({ isPending: true }))
    );

    // Final call: resolved with items
    await waitFor(() => {
      const calls = onResults.mock.calls;
      const last = calls[calls.length - 1]?.[0];
      expect(last?.isPending).toBe(false);
      expect(last?.isError).toBe(false);
      expect(last?.items).toHaveLength(1);
      expect(last?.items[0]?.label).toBe('React Hooks');
    });

    unmount();
  });

  it('returns asset items and collection items in results', async () => {
    const asset = makeAsset({ id: 'a1', title: 'My Asset', type: 'NOTE' });
    const collection = makeCollection({ id: 'c1', name: 'My Collection' });
    mockFetch
      .mockResolvedValueOnce(mockFetchResponse([asset]))
      .mockResolvedValueOnce(mockFetchResponse([collection]));

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="my" onResults={onResults} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      const calls = onResults.mock.calls;
      const last = calls[calls.length - 1]?.[0];
      expect(last?.isPending).toBe(false);
      const ids = last?.items.map((i: { id: string }) => i.id);
      expect(ids).toContain('vault-asset-a1');
      expect(ids).toContain('vault-collection-c1');
    });
  });

  it('reports isError=true when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="fail" onResults={onResults} />, {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      const calls = onResults.mock.calls;
      const last = calls[calls.length - 1]?.[0];
      expect(last?.isError).toBe(true);
      expect(last?.items).toEqual([]);
    });
  });
});

// ---------------------------------------------------------------------------
// Recents mode (empty query)
// ---------------------------------------------------------------------------

describe('VaultPaletteConnector — recents mode', () => {
  it('fetches recents when query is empty string', async () => {
    const asset = makeAsset({ id: 'r1', title: 'Recent One' });
    mockFetch.mockResolvedValueOnce(mockFetchResponse([asset]));

    const onResults = vi.fn();
    render(<VaultPaletteConnector query="" onResults={onResults} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      const calls = onResults.mock.calls;
      const last = calls[calls.length - 1]?.[0];
      expect(last?.isPending).toBe(false);
      expect(last?.items).toHaveLength(1);
      expect(last?.items[0]?.id).toBe('vault-asset-r1');
      expect(last?.items[0]?.group).toBe('Recent');
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
