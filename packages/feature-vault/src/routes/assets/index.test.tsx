import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

vi.mock('../../hooks/queries/use-assets', () => ({
  useAssetsQuery: () => ({ data: [] }),
}));
vi.mock('../../hooks/mutations/use-asset-mutations', () => ({
  useTogglePinAssetMutation: () => ({ mutateAsync: vi.fn() }),
  useDeleteAssetMutation: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../hooks/use-asset-drawer', () => ({
  useAssetDrawer: () => ({ openCreate: vi.fn() }),
}));

import { AssetsListPage } from './index';

function makeWrapper(opts: {
  initialEntry?: string;
  searchParams?: string;
  onUrlUpdate?: (e: UrlUpdateEvent) => void;
}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[opts.initialEntry ?? '/vault/assets']}>
        <NuqsTestingAdapter searchParams={opts.searchParams ?? ''} onUrlUpdate={opts.onUrlUpdate}>
          {children}
        </NuqsTestingAdapter>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AssetsListPage', () => {
  it('renders the in-page filter tab strip', () => {
    render(<AssetsListPage />, { wrapper: makeWrapper({}) });

    expect(screen.getByRole('tablist', { name: /filter assets by type/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /snippets/i })).toBeInTheDocument();
  });

  it('marks the "All" tab active when no type query param is set', () => {
    render(<AssetsListPage />, { wrapper: makeWrapper({}) });

    expect(screen.getByRole('tab', { name: /all/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /snippets/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('marks the matching tab active based on the type URL path', () => {
    render(<AssetsListPage />, {
      wrapper: makeWrapper({ initialEntry: '/vault/assets/snippets' }),
    });

    expect(screen.getByRole('tab', { name: /snippets/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('selects a type-specific URL path when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<AssetsListPage />, { wrapper: makeWrapper({}) });

    await user.click(screen.getByRole('tab', { name: /prompts/i }));

    expect(screen.getByRole('tab', { name: /prompts/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('clearing back to "All" returns to the base assets path', async () => {
    const user = userEvent.setup();
    render(<AssetsListPage />, {
      wrapper: makeWrapper({ initialEntry: '/vault/assets/notes' }),
    });

    await user.click(screen.getByRole('tab', { name: /all/i }));

    expect(screen.getByRole('tab', { name: /all/i })).toHaveAttribute('aria-selected', 'true');
  });
});
