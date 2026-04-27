import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('calls onConfirm when confirm button is clicked', async () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();
    render(
      <ConfirmDialog
        open
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete?"
        message="Are you sure?"
        confirmLabel="Delete"
        variant="danger"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();
    render(
      <ConfirmDialog
        open
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete?"
        message="Are you sure?"
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    render(
      <ConfirmDialog
        open={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete?"
        message="Are you sure?"
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
