import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Header } from './header';
import { useCommandPalette } from '@/hooks/use-command-palette';

const user = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  image: null,
};

function renderHeader(overrides: Partial<React.ComponentProps<typeof Header>> = {}) {
  const onSignOut = overrides.onSignOut ?? vi.fn();
  const onNavigateSettings = overrides.onNavigateSettings ?? vi.fn();
  const utils = render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <Header user={user} onSignOut={onSignOut} onNavigateSettings={onNavigateSettings} />
          }
        />
      </Routes>
    </MemoryRouter>
  );
  return { ...utils, onSignOut, onNavigateSettings };
}

afterEach(() => {
  act(() => {
    useCommandPalette.setState({ open: false, query: '' });
  });
});

describe('Header', () => {
  it('renders the command-palette trigger and user-menu trigger', () => {
    renderHeader();
    expect(screen.getAllByLabelText('Open command palette').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Open user menu')).toBeInTheDocument();
  });

  it('does NOT render a sidebar toggle, mobile menu, logo, or notifications icon', () => {
    const { container } = renderHeader();
    expect(screen.queryByLabelText(/collapse sidebar/i)).toBeNull();
    expect(screen.queryByLabelText(/expand sidebar/i)).toBeNull();
    expect(screen.queryByLabelText(/open menu/i)).toBeNull();
    expect(container.querySelector('[data-testid="logo"]')).toBeNull();
    expect(screen.queryByLabelText(/notification/i)).toBeNull();
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
