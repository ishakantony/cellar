import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { Folder, LayoutDashboard, Package, User } from 'lucide-react';
import type { FeatureManifest, FeatureModule } from '@cellar/shell-contract';
import type { ResolvedFeatureRegistryEntry } from '@/shell/route-composer';
import { FeatureSidebar } from './feature-sidebar';
import { createFeatureRegistry } from '@/shell/registry';

function makeResolved(
  id: string,
  basePath: string,
  label: string,
  rail: boolean,
  module: FeatureModule,
  accent?: string
): ResolvedFeatureRegistryEntry {
  const manifest: FeatureManifest = {
    id,
    label,
    icon: User,
    basePath,
    rail,
    accent,
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
  makeResolved('vault', '/vault', 'Vault', true, vaultModule, 'var(--color-vault-accent)'),
  makeResolved(
    'account',
    '/account',
    'Account',
    true,
    accountModule,
    'var(--color-account-accent)'
  ),
];

const registry = createFeatureRegistry(resolved.map(r => r.entry));

const user = { name: 'Test User', email: 'test@example.com' };

function renderSidebar(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <FeatureSidebar
        resolved={resolved}
        registry={registry}
        user={user}
        onNavigateSettings={() => {}}
      />
    </MemoryRouter>
  );
}

describe('FeatureSidebar', () => {
  it("renders the active feature's nav items based on the URL", () => {
    renderSidebar('/vault/assets');

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all items/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all collections/i })).toBeInTheDocument();
  });

  it('marks the matching nav item active via aria-current=page', () => {
    renderSidebar('/vault/collections');

    const collections = screen.getByRole('link', { name: /all collections/i });
    expect(collections).toHaveAttribute('aria-current', 'page');

    const assets = screen.getByRole('link', { name: /all items/i });
    expect(assets).not.toHaveAttribute('aria-current');
  });

  it('renders Account nav when the URL is under /account', () => {
    renderSidebar('/account/settings');

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /all items/i })).not.toBeInTheDocument();
  });

  it('falls back to the first rail-visible feature when no route matches', () => {
    renderSidebar('/somewhere/else');

    // Vault is rail-visible and listed first — its nav should appear.
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders the app switcher pill labeled with the active feature', () => {
    renderSidebar('/vault');

    expect(screen.getByRole('button', { name: /switch app.*current.*vault/i })).toBeInTheDocument();
  });

  it('renders the user footer with name and settings cog', () => {
    renderSidebar('/vault');

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /account settings/i })).toBeInTheDocument();
  });
});
