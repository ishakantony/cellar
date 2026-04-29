import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CollectionsView } from './collections-view';

const mockCollections = [
  {
    id: '1',
    name: 'Collection 1',
    description: null,
    color: '#3b82f6',
    pinned: false,
    _count: { assets: 3 },
  },
  {
    id: '2',
    name: 'Collection 2',
    description: null,
    color: '#10b981',
    pinned: false,
    _count: { assets: 5 },
  },
];

describe('CollectionsView', () => {
  it('renders empty state when no collections', () => {
    render(
      <CollectionsView
        collections={[]}
        view="grid"
        onCardClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('No collections found.')).toBeInTheDocument();
  });

  it('renders grid of collection cards', () => {
    render(
      <CollectionsView
        collections={mockCollections}
        view="grid"
        onCardClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Collection 1')).toBeInTheDocument();
    expect(screen.getByText('Collection 2')).toBeInTheDocument();
  });

  it('renders both section headers when pinned and unpinned both exist', () => {
    render(
      <CollectionsView
        collections={[{ ...mockCollections[0], pinned: true }, mockCollections[1]]}
        view="grid"
        onCardClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByRole('heading', { name: 'Pinned' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'All collections' })).toBeInTheDocument();
  });

  it('renders no headers when only unpinned collections exist', () => {
    render(
      <CollectionsView
        collections={mockCollections}
        view="grid"
        onCardClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.queryByRole('heading', { name: 'Pinned' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'All collections' })).not.toBeInTheDocument();
  });

  it('renders no headers when only pinned collections exist', () => {
    render(
      <CollectionsView
        collections={mockCollections.map(c => ({ ...c, pinned: true }))}
        view="grid"
        onCardClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.queryByRole('heading', { name: 'Pinned' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'All collections' })).not.toBeInTheDocument();
  });

  it('calls onCardClick with correct id', async () => {
    const handleClick = vi.fn();
    render(
      <CollectionsView
        collections={mockCollections}
        view="grid"
        onCardClick={handleClick}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    await userEvent.click(screen.getByText('Collection 1'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
