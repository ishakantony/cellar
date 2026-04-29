import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AssetType } from '@cellar/shared';
import { AssetCard } from './asset-card';

const mockOpenView = vi.fn();

vi.mock('../../hooks/use-asset-drawer', () => ({
  useAssetDrawer: () => ({ openView: mockOpenView }),
}));

const mockAsset = {
  id: '1',
  type: AssetType.NOTE,
  title: 'Launch Notes',
  pinned: false,
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('AssetCard', () => {
  beforeEach(() => {
    mockOpenView.mockClear();
  });

  it('calls openView with the asset id when the card is clicked', async () => {
    render(<AssetCard asset={mockAsset} onTogglePin={() => {}} onDelete={() => {}} />);

    await userEvent.click(screen.getByText('Launch Notes'));

    expect(mockOpenView).toHaveBeenCalledTimes(1);
    expect(mockOpenView).toHaveBeenCalledWith('1');
  });

  it('opens action menu from the icon button without opening the asset', async () => {
    render(<AssetCard asset={mockAsset} onTogglePin={() => {}} onDelete={() => {}} />);

    await userEvent.click(screen.getByLabelText('More actions'));

    expect(screen.getByRole('button', { name: 'Pin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(mockOpenView).not.toHaveBeenCalled();
  });

  it('calls action handlers from the menu', async () => {
    const handleTogglePin = vi.fn();

    render(<AssetCard asset={mockAsset} onTogglePin={handleTogglePin} onDelete={() => {}} />);

    await userEvent.click(screen.getByLabelText('More actions'));
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }));

    expect(handleTogglePin).toHaveBeenCalledTimes(1);
  });

  it('shows an amber pin icon next to the title when pinned', () => {
    render(
      <AssetCard
        asset={{ ...mockAsset, pinned: true }}
        onTogglePin={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByLabelText('Pinned')).toBeInTheDocument();
  });

  it('shows no pin icon when unpinned', () => {
    render(<AssetCard asset={mockAsset} onTogglePin={() => {}} onDelete={() => {}} />);

    expect(screen.queryByLabelText('Pinned')).not.toBeInTheDocument();
  });

  it('does not apply border or background tint classes when pinned', () => {
    const { container } = render(
      <AssetCard
        asset={{ ...mockAsset, pinned: true }}
        onTogglePin={() => {}}
        onDelete={() => {}}
      />
    );

    expect(container.querySelector('.\\!border-l-primary')).not.toBeInTheDocument();
    expect(container.querySelector('.bg-primary\\/5')).not.toBeInTheDocument();
  });
});
