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

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  image: null,
};

describe('Header sidebar controls', () => {
  it('renders the desktop sidebar toggle in the topbar when the sidebar is expanded', () => {
    render(
      <Header
        onMobileMenuToggle={vi.fn()}
        sidebarCollapsed={false}
        sidebarToggle={<SidebarToggle onClick={vi.fn()} collapsed={false} />}
        onAddCollection={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();
  });

  it('renders the reopen toggle in the topbar when the sidebar is collapsed', () => {
    render(
      <Header
        onMobileMenuToggle={vi.fn()}
        sidebarCollapsed={true}
        sidebarToggle={<SidebarToggle onClick={vi.fn()} collapsed={true} />}
        onAddCollection={vi.fn()}
      />
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
