import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Header } from './header';
import { useSidebarCollapse } from '@/shell/stores/sidebar-collapse';
import { useCommandPalette } from '@/hooks/use-command-palette';

const user = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  image: null,
};

function renderHeader(overrides: Partial<React.ComponentProps<typeof Header>> = {}) {
  const onMobileMenuToggle = overrides.onMobileMenuToggle ?? vi.fn();
  const onSignOut = overrides.onSignOut ?? vi.fn();
  const onNavigateSettings = overrides.onNavigateSettings ?? vi.fn();
  const utils = render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <Header
              user={user}
              onMobileMenuToggle={onMobileMenuToggle}
              onSignOut={onSignOut}
              onNavigateSettings={onNavigateSettings}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
  return { ...utils, onMobileMenuToggle, onSignOut, onNavigateSettings };
}

beforeEach(() => {
  act(() => {
    useSidebarCollapse.setState({ collapsed: false });
  });
});

afterEach(() => {
  act(() => {
    useCommandPalette.setState({ open: false, query: '' });
  });
});

describe('Header', () => {
  it('renders the three header zones', () => {
    renderHeader();
    // Left: mobile menu toggle + sidebar collapse toggle
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    expect(screen.getByLabelText(/sidebar/i)).toBeInTheDocument();
    // Center: command palette trigger (two responsive variants)
    expect(screen.getAllByLabelText('Open command palette').length).toBeGreaterThan(0);
    // Right: user avatar trigger
    expect(screen.getByLabelText('Open user menu')).toBeInTheDocument();
  });

  it('does NOT render a logo or notifications icon in the header', () => {
    const { container } = renderHeader();
    expect(container.querySelector('[data-testid="logo"]')).toBeNull();
    expect(screen.queryByLabelText(/notification/i)).toBeNull();
  });

  it('shows the ⌘B shortcut hint in the sidebar-collapse tooltip on hover', () => {
    renderHeader();
    const toggle = screen.getByLabelText('Collapse sidebar');
    // Tooltip wraps the button in an inline-flex div – fire enter on the
    // wrapper to open the portal.
    const wrapper = toggle.parentElement!;
    fireEvent.mouseEnter(wrapper);

    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
    // Tooltip text should include either ⌘B or Ctrl+B depending on platform.
    expect(tooltip!.textContent).toMatch(/(⌘|Ctrl\+)B/);
  });

  it('toggles the sidebar-collapse store when the toggle is clicked', () => {
    renderHeader();
    expect(useSidebarCollapse.getState().collapsed).toBe(false);
    fireEvent.click(screen.getByLabelText('Collapse sidebar'));
    expect(useSidebarCollapse.getState().collapsed).toBe(true);
  });

  it('opens the user menu and shows the user name and email', () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText('Open user menu'));

    const menu = screen.getByRole('menu', { name: 'User menu' });
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveTextContent('Ada Lovelace');
    expect(menu).toHaveTextContent('ada@example.com');
  });

  it('Settings menu item triggers navigation to /account/settings', () => {
    const { onNavigateSettings } = renderHeader();
    fireEvent.click(screen.getByLabelText('Open user menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /settings/i }));
    expect(onNavigateSettings).toHaveBeenCalledTimes(1);
  });

  it('Sign out menu item triggers onSignOut', () => {
    const { onSignOut } = renderHeader();
    fireEvent.click(screen.getByLabelText('Open user menu'));
    fireEvent.click(screen.getByRole('menuitem', { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('closes the user menu when clicking outside', () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText('Open user menu'));
    expect(screen.queryByRole('menu', { name: 'User menu' })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
  });
});
