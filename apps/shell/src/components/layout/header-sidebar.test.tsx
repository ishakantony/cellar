import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { SidebarToggle } from './sidebar-toggle';
import { SidebarLogo } from './sidebar-logo';

vi.mock('@/lib/auth-client', () => ({
  signOut: vi.fn(),
}));

// CommandTrigger uses the useCommandPalette store — we just need it not to crash
vi.mock('@/hooks/use-command-palette', () => ({
  useCommandPalette: () => ({ setOpen: vi.fn(), open: false, query: '' }),
}));

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  image: null,
};

describe('Header sidebar controls', () => {
  it('renders the desktop sidebar toggle in the topbar when the sidebar is expanded', () => {
    render(
      <MemoryRouter>
        <Header
          onMobileMenuToggle={vi.fn()}
          sidebarCollapsed={false}
          sidebarToggle={<SidebarToggle onClick={vi.fn()} collapsed={false} />}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();
  });

  it('renders the reopen toggle in the topbar when the sidebar is collapsed', () => {
    render(
      <MemoryRouter>
        <Header
          onMobileMenuToggle={vi.fn()}
          sidebarCollapsed={true}
          sidebarToggle={<SidebarToggle onClick={vi.fn()} collapsed={true} />}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
  });
});

describe('Sidebar layout', () => {
  it('does not render a desktop toggle inside the sidebar logo row', () => {
    render(<SidebarLogo />);

    expect(screen.queryByRole('button', { name: /sidebar/i })).not.toBeInTheDocument();
  });

  it('uses animatable width classes when collapsed instead of hiding the sidebar with display rules', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar collapsed={true} user={mockUser} />
      </MemoryRouter>
    );

    const aside = container.querySelector('aside');

    expect(aside).toHaveClass('w-0');
    expect(aside).not.toHaveClass('md:hidden');
    expect(aside).toHaveClass('transition-[width,border-color]');
  });
});
