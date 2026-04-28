import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CollectionCard } from './collection-card';

const mockCollection = {
  id: '1',
  name: 'Test Collection',
  description: 'A test description',
  color: '#3b82f6',
  pinned: false,
  _count: { assets: 5 },
};

describe('CollectionCard', () => {
  it('renders collection name and asset count in grid layout', () => {
    render(
      <CollectionCard
        collection={mockCollection}
        layout="grid"
        onClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('5 items')).toBeInTheDocument();
  });

  it('renders collection name and description in list layout', () => {
    render(
      <CollectionCard
        collection={mockCollection}
        layout="list"
        onClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
    expect(screen.getByText('5 items')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', async () => {
    const handleClick = vi.fn();
    render(
      <CollectionCard
        collection={mockCollection}
        layout="grid"
        onClick={handleClick}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    await userEvent.click(screen.getByText('Test Collection'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit action is clicked', async () => {
    const handleEdit = vi.fn();
    const { container } = render(
      <CollectionCard
        collection={mockCollection}
        layout="grid"
        onClick={() => {}}
        onTogglePin={() => {}}
        onEdit={handleEdit}
        onDelete={() => {}}
      />
    );

    // Click the ActionMenu trigger wrapper div (not the button itself, which has stopPropagation)
    const triggerWrapper = container.querySelector('.relative > div');
    if (triggerWrapper) {
      fireEvent.click(triggerWrapper);
    }

    // Find and click edit button in the dropdown
    const editBtn = screen.getAllByRole('button').find(b => b.textContent?.trim() === 'Edit');
    if (editBtn) {
      await userEvent.click(editBtn);
    }
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('renders the pin icon when collection is pinned in grid layout', () => {
    render(
      <CollectionCard
        collection={{ ...mockCollection, pinned: true }}
        layout="grid"
        onClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByLabelText('Pinned')).toBeInTheDocument();
  });

  it('renders the pin icon when collection is pinned in list layout', () => {
    render(
      <CollectionCard
        collection={{ ...mockCollection, pinned: true }}
        layout="list"
        onClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByLabelText('Pinned')).toBeInTheDocument();
  });

  it('does not render the pin icon when collection is not pinned', () => {
    render(
      <CollectionCard
        collection={mockCollection}
        layout="grid"
        onClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.queryByLabelText('Pinned')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete action is clicked', async () => {
    const handleDelete = vi.fn();
    const { container } = render(
      <CollectionCard
        collection={mockCollection}
        layout="grid"
        onClick={() => {}}
        onTogglePin={() => {}}
        onEdit={() => {}}
        onDelete={handleDelete}
      />
    );

    const triggerWrapper = container.querySelector('.relative > div');
    if (triggerWrapper) {
      fireEvent.click(triggerWrapper);
    }

    const deleteBtn = screen.getAllByRole('button').find(b => b.textContent?.trim() === 'Delete');
    if (deleteBtn) {
      await userEvent.click(deleteBtn);
    }
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });
});
