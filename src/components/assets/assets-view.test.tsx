import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetsView } from './assets-view';
import { AssetType } from '@/generated/prisma/enums';

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
        onCardClick={vi.fn()}
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
        onCardClick={vi.fn()}
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Nothing here"
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('calls onCardClick when card clicked', () => {
    const onCardClick = vi.fn();
    render(
      <AssetsView
        assets={MOCK_ASSETS}
        view="grid"
        onCardClick={onCardClick}
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    fireEvent.click(screen.getByText('Test'));
    expect(onCardClick).toHaveBeenCalledWith('1');
  });

  it('highlights pinned assets with a left border', () => {
    const { container } = render(
      <AssetsView
        assets={[{ ...MOCK_ASSETS[0], pinned: true }]}
        view="grid"
        onCardClick={vi.fn()}
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(container.querySelector('.\\!border-l-primary')).toBeInTheDocument();
  });

  it('does not highlight unpinned assets with a left border', () => {
    const { container } = render(
      <AssetsView
        assets={MOCK_ASSETS}
        view="grid"
        onCardClick={vi.fn()}
        onTogglePin={vi.fn()}
        onDelete={vi.fn()}
        emptyMessage="Empty"
      />
    );
    expect(container.querySelector('.\\!border-l-primary')).not.toBeInTheDocument();
  });
});
