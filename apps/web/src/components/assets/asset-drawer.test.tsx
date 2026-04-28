import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { AssetType } from '@cellar/shared';

vi.mock('@/hooks/queries/use-assets', () => ({
  useAssetQuery: vi.fn(),
}));
vi.mock('@/hooks/mutations/use-asset-mutations', () => ({
  useTogglePinAssetMutation: vi.fn(),
  useDeleteAssetMutation: vi.fn(),
}));
vi.mock('./asset-content-renderer', () => ({
  AssetContentRenderer: () => <div data-testid="asset-content" />,
}));

import { useAssetQuery } from '@/hooks/queries/use-assets';
import {
  useTogglePinAssetMutation,
  useDeleteAssetMutation,
} from '@/hooks/mutations/use-asset-mutations';
import { AssetDrawer } from './asset-drawer';

const mockAsset = {
  id: 'abc123',
  userId: 'user1',
  type: AssetType.NOTE,
  title: 'My Test Note',
  description: 'A test asset description',
  pinned: false,
  content: '# Hello',
  language: null,
  url: null,
  filePath: null,
  fileName: null,
  mimeType: null,
  fileSize: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
  collections: [],
};

function makeWrapper(searchParams?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter searchParams={searchParams} hasMemory>
        {children}
      </NuqsTestingAdapter>
    </QueryClientProvider>
  );
}

describe('AssetDrawer', () => {
  beforeEach(() => {
    vi.mocked(useAssetQuery).mockReturnValue({
      isPending: false,
      data: mockAsset,
    } as unknown as ReturnType<typeof useAssetQuery>);

    vi.mocked(useTogglePinAssetMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as unknown as ReturnType<typeof useTogglePinAssetMutation>);

    vi.mocked(useDeleteAssetMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
    } as unknown as ReturnType<typeof useDeleteAssetMutation>);
  });

  it('is closed when neither ?id nor ?new is present', () => {
    render(<AssetDrawer />, { wrapper: makeWrapper() });
    expect(screen.queryByRole('button', { name: 'Close drawer' })).not.toBeInTheDocument();
  });

  it('opens and shows the asset title when ?id is set', () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    expect(screen.getByText('My Test Note')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument();
  });

  it('closes on Escape key press and clears ?id', async () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    expect(screen.getByText('My Test Note')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('calls pin mutation with the asset id when pin button is clicked', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useTogglePinAssetMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useTogglePinAssetMutation>);

    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }));

    expect(mutateAsync).toHaveBeenCalledWith('abc123');
  });

  it('opens confirm dialog when delete is clicked', async () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls delete mutation and closes drawer on confirm', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useDeleteAssetMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useDeleteAssetMutation>);

    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(mutateAsync).toHaveBeenCalledWith('abc123');
    expect(screen.queryByText('My Test Note')).not.toBeInTheDocument();
  });

  it('shows loading state while asset is fetching', () => {
    vi.mocked(useAssetQuery).mockReturnValue({
      isPending: true,
      data: undefined,
    } as unknown as ReturnType<typeof useAssetQuery>);

    render(<AssetDrawer />, { wrapper: makeWrapper('?id=abc123') });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('opens with create placeholder when ?new=1 is set', () => {
    render(<AssetDrawer />, { wrapper: makeWrapper('?new=1') });
    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument();
  });
});
