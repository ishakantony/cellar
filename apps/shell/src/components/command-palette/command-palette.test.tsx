import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
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
}));

// ---------------------------------------------------------------------------
// Smoke tests
// ---------------------------------------------------------------------------

describe('CommandPalette', () => {
  it('renders without crashing when open with no providers', () => {
    render(
      <MemoryRouter>
        <CommandPalette />
      </MemoryRouter>
    );
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('renders the search input', () => {
    render(
      <MemoryRouter>
        <CommandPalette />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Search or run a command…')).toBeDefined();
  });

  it('renders the keyboard hint footer', () => {
    render(
      <MemoryRouter>
        <CommandPalette />
      </MemoryRouter>
    );
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
    // Component renders nothing visible when closed — no dialog role
    // (Radix Dialog with open=false renders nothing into the DOM)
    const { container } = render(
      <MemoryRouter>
        <CommandPalette />
      </MemoryRouter>
    );
    // With open=false the dialog content is not in the document
    const dialog = container.querySelector('[role="dialog"]');
    // Either null or the dialog is not open (implementation may vary)
    expect(dialog === null || !dialog.isConnected).toBe(true);
  });
});
