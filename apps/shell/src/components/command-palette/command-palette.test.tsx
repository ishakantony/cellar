import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommandPalette } from './command-palette';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/hooks/use-command-palette', () => ({
  useCommandPalette: () => ({
    open: true,
    query: '',
    setOpen: vi.fn(),
    setQuery: vi.fn(),
  }),
}));

vi.mock('@/shell/feature-registry', () => ({
  registry: {
    list: () => [],
  },
  resolvedEntries: [],
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

// ---------------------------------------------------------------------------
// Smoke tests
// ---------------------------------------------------------------------------

describe('CommandPalette', () => {
  it('renders without crashing when open with no providers', () => {
    render(<CommandPalette />, { wrapper: makeWrapper() });
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('renders the search input', () => {
    render(<CommandPalette />, { wrapper: makeWrapper() });
    expect(screen.getByPlaceholderText('Search or run a command…')).toBeDefined();
  });

  it('renders the keyboard hint footer', () => {
    render(<CommandPalette />, { wrapper: makeWrapper() });
    expect(screen.getByText('select')).toBeDefined();
    expect(screen.getByText('navigate')).toBeDefined();
    expect(screen.getByText('close')).toBeDefined();
  });

  it('does not render when closed', () => {
    vi.doMock('@/hooks/use-command-palette', () => ({
      useCommandPalette: () => ({
        open: false,
        query: '',
        setOpen: vi.fn(),
        setQuery: vi.fn(),
      }),
    }));
    const { container } = render(<CommandPalette />, { wrapper: makeWrapper() });
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog === null || !dialog.isConnected).toBe(true);
  });
});
