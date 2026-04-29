import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssetsView } from './assets-view';
import { AssetType } from '@cellar/shared';

vi.mock('../../hooks/use-asset-drawer', () => ({
  useAssetDrawer: () => ({ openView: vi.fn() }),
}));

const MOCK_ASSETS = [
  {
    id: '1',
    type: AssetType.SNIPPET,
    title: 'Test',
    language: null,
    pinned: false,
    updatedAt: new Date(),
  },
];

describe('AssetsView', () => {
  it('renders grid view', () => {
    render(
      <AssetsView
        assets={MOCK_ASSETS}
        view="grid"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <AssetsView
        assets={[]}
        view="grid"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Nothing here"
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders a Pinned section heading when assets are pinned', () => {
    render(
      <AssetsView
        assets={[{ ...MOCK_ASSETS[0], pinned: true }]}
        view="grid"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('does not render a Pinned section heading when no assets are pinned', () => {
    render(
      <AssetsView
        assets={MOCK_ASSETS}
        view="grid"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
  });

  it('renders pinned assets before unpinned assets', () => {
    render(
      <AssetsView
        assets={[
          { ...MOCK_ASSETS[0], id: '1', title: 'Unpinned Asset', pinned: false },
          { ...MOCK_ASSETS[0], id: '2', title: 'Pinned Asset', pinned: true },
        ]}
        view="grid"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    const allTitles = screen.getAllByRole('heading', { level: 4 }).map(el => el.textContent);
    expect(allTitles.indexOf('Pinned Asset')).toBeLessThan(allTitles.indexOf('Unpinned Asset'));
  });

  it('renders sectioned layout in list view mode', () => {
    render(
      <AssetsView
        assets={[{ ...MOCK_ASSETS[0], pinned: true }]}
        view="list"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('renders an All heading when both pinned and unpinned assets exist', () => {
    render(
      <AssetsView
        assets={[
          { ...MOCK_ASSETS[0], id: '1', pinned: true },
          { ...MOCK_ASSETS[0], id: '2', pinned: false },
        ]}
        view="grid"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('does not render an All heading when only pinned assets exist', () => {
    render(
      <AssetsView
        assets={[{ ...MOCK_ASSETS[0], pinned: true }]}
        view="grid"
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(screen.queryByText('All')).not.toBeInTheDocument();
  });
});
