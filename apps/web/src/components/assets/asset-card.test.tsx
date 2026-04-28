import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AssetType } from '@cellar/shared';
import { AssetCard } from './asset-card';

const mockAsset = {
  id: '1',
  type: AssetType.NOTE,
  title: 'Launch Notes',
  pinned: false,
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('AssetCard', () => {
  it('opens action menu from the icon button without opening the asset', async () => {
    const handleClick = vi.fn();

    render(
      <AssetCard
        asset={mockAsset}
        onClick={handleClick}
        onTogglePin={() => {}}
        onDelete={() => {}}
      />
    );

    await userEvent.click(screen.getByLabelText('More actions'));

    expect(screen.getByRole('button', { name: 'Pin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('calls action handlers from the menu', async () => {
    const handleTogglePin = vi.fn();

    render(
      <AssetCard
        asset={mockAsset}
        onClick={() => {}}
        onTogglePin={handleTogglePin}
        onDelete={() => {}}
      />
    );

    await userEvent.click(screen.getByLabelText('More actions'));
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }));

    expect(handleTogglePin).toHaveBeenCalledTimes(1);
  });

  it('shows an amber pin icon next to the title when pinned', () => {
    render(
      <AssetCard
        asset={{ ...mockAsset, pinned: true }}
        onClick={() => {}}
        onTogglePin={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByLabelText('Pinned')).toBeInTheDocument();
  });

  it('shows no pin icon when unpinned', () => {
    render(
      <AssetCard asset={mockAsset} onClick={() => {}} onTogglePin={() => {}} onDelete={() => {}} />
    );

    expect(screen.queryByLabelText('Pinned')).not.toBeInTheDocument();
  });

  it('does not apply border or background tint classes when pinned', () => {
    const { container } = render(
      <AssetCard
        asset={{ ...mockAsset, pinned: true }}
        onClick={() => {}}
        onTogglePin={() => {}}
        onDelete={() => {}}
      />
    );

    expect(container.querySelector('.\\!border-l-primary')).not.toBeInTheDocument();
    expect(container.querySelector('.bg-primary\\/5')).not.toBeInTheDocument();
  });
});
