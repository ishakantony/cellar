import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Folder, LayoutDashboard, Package, User } from 'lucide-react';
import type { FeatureManifest, FeatureModule } from '@cellar/shell-contract';
import type { ResolvedFeatureRegistryEntry } from '@/shell/route-composer';
import { FeatureSidebar } from './feature-sidebar';
import { useSidebarCollapse } from '@/shell/stores/sidebar-collapse';

function makeResolved(
  id: string,
  basePath: string,
  label: string,
  rail: boolean,
  module: FeatureModule
): ResolvedFeatureRegistryEntry {
  const manifest: FeatureManifest = {
    id,
    label,
    icon: User,
    basePath,
    rail,
  };
  return {
    entry: { manifest, load: async () => module },
    module,
  };
}

const vaultModule: FeatureModule = {
  routes: [],
  nav: [
    {
      items: [
        { id: 'home', label: 'Dashboard', href: '/vault', icon: LayoutDashboard },
        { id: 'assets', label: 'All Items', href: '/vault/assets', icon: Package },
        { id: 'collections', label: 'All Collections', href: '/vault/collections', icon: Folder },
      ],
    },
  ],
};

const accountModule: FeatureModule = {
  routes: [],
  nav: [{ items: [{ id: 'settings', label: 'Settings', href: '/account/settings', icon: User }] }],
};

const resolved: ResolvedFeatureRegistryEntry[] = [
  makeResolved('vault', '/vault', 'Vault', true, vaultModule),
  makeResolved('account', '/account', 'Account', false, accountModule),
];

beforeEach(() => {
  act(() => {
    useSidebarCollapse.setState({ collapsed: false });
  });
});

describe('FeatureSidebar', () => {
  it("renders the active feature's nav items based on the URL", () => {
    render(
      <MemoryRouter initialEntries={['/vault/assets']}>
        <FeatureSidebar resolved={resolved} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all items/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all collections/i })).toBeInTheDocument();
  });

  it('marks the matching nav item active via aria-current=page', () => {
    render(
      <MemoryRouter initialEntries={['/vault/collections']}>
        <FeatureSidebar resolved={resolved} />
      </MemoryRouter>
    );

    const collections = screen.getByRole('link', { name: /all collections/i });
    expect(collections).toHaveAttribute('aria-current', 'page');

    const assets = screen.getByRole('link', { name: /all items/i });
    expect(assets).not.toHaveAttribute('aria-current');
  });

  it('renders Account nav when the URL is under /account, even though Account is rail:false', () => {
    render(
      <MemoryRouter initialEntries={['/account/settings']}>
        <FeatureSidebar resolved={resolved} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    // Vault entries should not show.
    expect(screen.queryByRole('link', { name: /all items/i })).not.toBeInTheDocument();
  });

  it('falls back to the first rail-visible feature when no route matches', () => {
    render(
      <MemoryRouter initialEntries={['/somewhere/else']}>
        <FeatureSidebar resolved={resolved} />
      </MemoryRouter>
    );

    // Vault is rail-visible and listed first — its nav should appear.
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('collapses to width 0 when the sidebar-collapse store is collapsed', () => {
    act(() => {
      useSidebarCollapse.setState({ collapsed: true });
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/vault']}>
        <FeatureSidebar resolved={resolved} />
      </MemoryRouter>
    );

    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-0');
    expect(aside).not.toHaveClass('w-56');
  });
});
