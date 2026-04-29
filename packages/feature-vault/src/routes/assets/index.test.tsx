import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing';
import type { ReactNode } from 'react';

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

function makeWrapper(opts: { searchParams?: string; onUrlUpdate?: (e: UrlUpdateEvent) => void }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter searchParams={opts.searchParams ?? ''} onUrlUpdate={opts.onUrlUpdate}>
        {children}
      </NuqsTestingAdapter>
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

  it('marks the matching tab active based on the type URL query param', () => {
    render(<AssetsListPage />, {
      wrapper: makeWrapper({ searchParams: '?type=SNIPPET' }),
    });

    expect(screen.getByRole('tab', { name: /snippets/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('updates the URL query param when a tab is clicked', async () => {
    const onUrlUpdate = vi.fn();
    const user = userEvent.setup();
    render(<AssetsListPage />, { wrapper: makeWrapper({ onUrlUpdate }) });

    await user.click(screen.getByRole('tab', { name: /prompts/i }));

    expect(onUrlUpdate).toHaveBeenCalled();
    const lastCall = onUrlUpdate.mock.calls.at(-1)![0] as UrlUpdateEvent;
    expect(lastCall.searchParams.get('type')).toBe('PROMPT');
  });

  it('clearing back to "All" removes the type query param from the URL', async () => {
    const onUrlUpdate = vi.fn();
    const user = userEvent.setup();
    render(<AssetsListPage />, {
      wrapper: makeWrapper({ searchParams: '?type=NOTE', onUrlUpdate }),
    });

    await user.click(screen.getByRole('tab', { name: /all/i }));

    expect(onUrlUpdate).toHaveBeenCalled();
    const lastCall = onUrlUpdate.mock.calls.at(-1)![0] as UrlUpdateEvent;
    expect(lastCall.searchParams.get('type')).toBeNull();
  });
});
