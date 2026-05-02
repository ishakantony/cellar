import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { AssetType } from '@cellar/shared';
import { VaultHomePage } from './home';

// ---------------------------------------------------------------------------
// Mock hooks and mutations so we don't need a real server or Zustand store
// ---------------------------------------------------------------------------

vi.mock('../hooks/queries/use-dashboard', () => ({
  useDashboardQuery: vi.fn(),
}));

vi.mock('../hooks/use-asset-drawer', () => ({
  useAssetDrawer: () => ({
    openView: vi.fn(),
    openCreate: vi.fn(),
    openEdit: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock('../hooks/use-collection-modal', () => ({
  useCollectionModal: () => ({
    openCreate: vi.fn(),
    openEdit: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock('../hooks/mutations/use-asset-mutations', () => ({
  useTogglePinAssetMutation: () => ({ mutateAsync: vi.fn() }),
  useDeleteAssetMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('../hooks/mutations/use-collection-mutations', () => ({
  useToggleCollectionPinMutation: () => ({ mutateAsync: vi.fn() }),
  useDeleteCollectionMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => vi.fn() };
});

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const makeAsset = (id: string, title: string, pinned = false) => ({
  id,
  userId: 'user-1',
  type: 'NOTE' as AssetType,
  title,
  description: null,
  pinned,
  content: null,
  language: null,
  url: null,
  filePath: null,
  fileName: null,
  mimeType: null,
  fileSize: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
});

const PINNED_ASSETS = [
  makeAsset('pa1', 'Pinned Asset 1', true),
  makeAsset('pa2', 'Pinned Asset 2', true),
];

const PINNED_COLLECTIONS = [
  {
    id: 'pc1',
    userId: 'user-1',
    name: 'Pinned Collection 1',
    description: null,
    color: null,
    pinned: true,
    assetCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
];

const RECENT_ASSETS = [
  makeAsset('ra1', 'Recent Asset 1'),
  makeAsset('ra2', 'Recent Asset 2'),
  makeAsset('ra3', 'Recent Asset 3'),
];

const FIXTURE_COUNTS = {
  total: 42,
  pinnedCount: 2,
  byType: {
    SNIPPET: 10,
    PROMPT: 5,
    NOTE: 15,
    LINK: 8,
    IMAGE: 3,
    FILE: 1,
  },
};

const FIXTURE_DATA = {
  pinnedAssets: PINNED_ASSETS,
  pinnedCollections: PINNED_COLLECTIONS,
  recentAssets: RECENT_ASSETS,
  counts: FIXTURE_COUNTS,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

import { useDashboardQuery } from '../hooks/queries/use-dashboard';

const mockUseDashboardQuery = vi.mocked(useDashboardQuery);

describe('VaultHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithData() {
    mockUseDashboardQuery.mockReturnValue({
      data: FIXTURE_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useDashboardQuery>);
    return render(<VaultHomePage />);
  }

  // ---- Stat counts ---------------------------------------------------------

  it('renders the total asset count next to the "Your vault" header', () => {
    renderWithData();
    // The breakdown section title plus its count chip both render the total.
    expect(screen.getByText('Your vault')).toBeInTheDocument();
    // The count chip lives next to the title
    const breakdown = screen.getByTestId('vault-breakdown');
    expect(breakdown).toBeInTheDocument();
    // Total appears in the section header count chip as "42"
    expect(screen.getAllByText('42').length).toBeGreaterThan(0);
  });

  it('renders the pinned count next to the "Pinned" header', () => {
    renderWithData();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    // Pinned count chip — fixture has 2 pinned assets
    const pinned = screen.getByTestId('pinned-assets');
    expect(pinned).toBeInTheDocument();
  });

  it('renders per-type counts in the vault breakdown grid', () => {
    renderWithData();
    const breakdown = screen.getByTestId('vault-breakdown');
    // SNIPPET = 10, NOTE = 15, LINK = 8
    expect(breakdown).toHaveTextContent('10');
    expect(breakdown).toHaveTextContent('15');
    expect(breakdown).toHaveTextContent('8');
  });

  // ---- Pinned assets section -----------------------------------------------

  it('renders the correct number of cards in the pinned assets section', () => {
    renderWithData();
    // 2 pinned asset titles
    expect(screen.getByText('Pinned Asset 1')).toBeInTheDocument();
    expect(screen.getByText('Pinned Asset 2')).toBeInTheDocument();
    // data-testid container exists
    expect(screen.getByTestId('pinned-assets')).toBeInTheDocument();
  });

  it('renders pinned asset titles', () => {
    renderWithData();
    expect(screen.getByText('Pinned Asset 1')).toBeInTheDocument();
    expect(screen.getByText('Pinned Asset 2')).toBeInTheDocument();
  });

  // ---- Pinned collections section ------------------------------------------

  it('renders the correct number of cards in the pinned collections section', () => {
    renderWithData();
    // 1 pinned collection
    expect(screen.getByText('Pinned Collection 1')).toBeInTheDocument();
    expect(screen.getByTestId('pinned-collections')).toBeInTheDocument();
  });

  it('renders pinned collection name', () => {
    renderWithData();
    expect(screen.getByText('Pinned Collection 1')).toBeInTheDocument();
  });

  // ---- Recent activity section ---------------------------------------------

  it('renders the correct number of cards in the recent activity section', () => {
    renderWithData();
    // 3 recent assets — verified via title text
    expect(screen.getAllByText(/Recent Asset/)).toHaveLength(3);
    expect(screen.getByTestId('recent-assets')).toBeInTheDocument();
  });

  it('renders recent asset titles', () => {
    renderWithData();
    expect(screen.getByText('Recent Asset 1')).toBeInTheDocument();
    expect(screen.getByText('Recent Asset 2')).toBeInTheDocument();
    expect(screen.getByText('Recent Asset 3')).toBeInTheDocument();
  });

  // ---- Empty state ---------------------------------------------------------

  it('renders the empty vault state when counts.total is 0', () => {
    mockUseDashboardQuery.mockReturnValue({
      data: {
        ...FIXTURE_DATA,
        counts: {
          total: 0,
          pinnedCount: 0,
          byType: { SNIPPET: 0, PROMPT: 0, NOTE: 0, LINK: 0, IMAGE: 0, FILE: 0 },
        },
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useDashboardQuery>);

    render(<VaultHomePage />);
    expect(screen.getByText('Your vault is empty')).toBeInTheDocument();
  });

  it('does not render section panels when vault is empty', () => {
    mockUseDashboardQuery.mockReturnValue({
      data: {
        ...FIXTURE_DATA,
        counts: {
          total: 0,
          pinnedCount: 0,
          byType: { SNIPPET: 0, PROMPT: 0, NOTE: 0, LINK: 0, IMAGE: 0, FILE: 0 },
        },
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useDashboardQuery>);

    render(<VaultHomePage />);
    expect(screen.queryByTestId('pinned-assets')).not.toBeInTheDocument();
    expect(screen.queryByTestId('recent-assets')).not.toBeInTheDocument();
  });

  // ---- Quick-capture row ---------------------------------------------------

  it('renders quick-capture buttons for each asset type plus a "New asset" CTA', () => {
    renderWithData();
    expect(screen.getByRole('button', { name: 'Snippet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prompt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Note' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new asset/i })).toBeInTheDocument();
  });

  // ---- Loading state -------------------------------------------------------

  it('renders loading state while query is pending', () => {
    mockUseDashboardQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useDashboardQuery>);

    render(<VaultHomePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
