import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ViewToggle } from './view-toggle';

describe('ViewToggle', () => {
  it('calls onChange with grid when grid button is clicked', async () => {
    const handleChange = vi.fn();
    render(<ViewToggle view="list" onChange={handleChange} />);

    await userEvent.click(screen.getByRole('button', { name: /grid view/i }));
    expect(handleChange).toHaveBeenCalledWith('grid');
  });

  it('calls onChange with list when list button is clicked', async () => {
    const handleChange = vi.fn();
    render(<ViewToggle view="grid" onChange={handleChange} />);

    await userEvent.click(screen.getByRole('button', { name: /list view/i }));
    expect(handleChange).toHaveBeenCalledWith('list');
  });
});
