import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Package, User, Wrench } from 'lucide-react';
import type { FeatureRegistryEntry } from '@cellar/shell-contract';
import { AppSwitcherRail } from './app-switcher-rail';
import { useRailPin } from '@/shell/stores/rail-pin';

function makeEntry(
  id: string,
  label: string,
  basePath: string,
  icon: FeatureRegistryEntry['manifest']['icon'],
  rail: boolean
): FeatureRegistryEntry {
  return {
    manifest: { id, label, icon, basePath, rail },
    load: async () => ({ routes: [], nav: [] }),
  };
}

const vault = makeEntry('vault', 'Vault', '/vault', Package, true);
const toolbox = makeEntry('toolbox', 'Toolbox', '/toolbox', Wrench, true);
const account = makeEntry('account', 'Account', '/account', User, false);

beforeEach(() => {
  // Reset persisted rail pin so each test starts unpinned.
  act(() => {
    useRailPin.setState({ pinned: false });
  });
});

function renderRail(initialPath = '/vault', entries = [vault, toolbox, account]) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<AppSwitcherRail entries={entries} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AppSwitcherRail', () => {
  it('renders one button per rail-visible feature and skips rail:false features', () => {
    renderRail();

    expect(screen.getByRole('button', { name: 'Vault' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toolbox' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
  });

  it('renders the Cellar mark in the top slot', () => {
    const { container } = renderRail();
    // The mark is the small svg-bearing div in the rail's top slot — assert the
    // logo svg is present.
    const aside = container.querySelector('aside');
    expect(aside?.querySelector('svg')).toBeTruthy();
  });

  it('marks the active feature with aria-current=page based on the URL prefix', () => {
    renderRail('/vault/assets');
    const vaultBtn = screen.getByRole('button', { name: 'Vault' });
    expect(vaultBtn).toHaveAttribute('aria-current', 'page');
    const toolboxBtn = screen.getByRole('button', { name: 'Toolbox' });
    expect(toolboxBtn).not.toHaveAttribute('aria-current');
  });

  it('starts at icon-only width (~56px) when not pinned', () => {
    const { container } = renderRail();
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-14');
    expect(aside).not.toHaveClass('w-[180px]');
  });

  it('expands to wide width (~180px) when the pin toggle is clicked', () => {
    const { container } = renderRail();
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('w-14');

    const toggle = screen.getByRole('button', { name: /expand rail/i });
    fireEvent.click(toggle);

    expect(aside).toHaveClass('w-[180px]');
    expect(aside).not.toHaveClass('w-14');
  });

  it('uses a width transition class consistent with the spec (200ms ease-out)', () => {
    const { container } = renderRail();
    const aside = container.querySelector('aside');
    expect(aside?.className).toMatch(/transition-\[width\]/);
    expect(aside?.className).toMatch(/duration-200/);
    expect(aside?.className).toMatch(/ease-out/);
  });

  it('shows the feature label inline once the rail is pinned wide', () => {
    renderRail();
    // Initially icon-only — labels appear on aria-label only.
    expect(screen.queryByText('Vault', { selector: 'span' })).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /expand rail/i });
    fireEvent.click(toggle);

    expect(screen.getByText('Vault', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Toolbox', { selector: 'span' })).toBeInTheDocument();
  });

  it('clicking a feature button navigates to its basePath', () => {
    let observed = '';
    function PathProbe() {
      const loc = window.location.pathname;
      observed = loc;
      return null;
    }

    render(
      <MemoryRouter initialEntries={['/vault']}>
        <AppSwitcherRail entries={[vault, toolbox]} />
        <Routes>
          <Route path="/toolbox" element={<div data-testid="toolbox-page">toolbox</div>} />
          <Route path="/vault" element={<div data-testid="vault-page">vault</div>} />
        </Routes>
        <PathProbe />
      </MemoryRouter>
    );

    expect(screen.getByTestId('vault-page')).toBeInTheDocument();
    const toolboxBtn = screen.getByRole('button', { name: 'Toolbox' });
    fireEvent.click(toolboxBtn);
    expect(screen.getByTestId('toolbox-page')).toBeInTheDocument();
    // Touch `observed` so the assignment is not flagged as dead by linters.
    void observed;
  });
});
