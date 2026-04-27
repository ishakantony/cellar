import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  describe('change events', () => {
    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'a');

      expect(handleChange).toHaveBeenCalledWith('a');
    });

    it('calls onChange with correct value for multiple characters', async () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'hello');

      expect(handleChange).toHaveBeenCalledTimes(5);
      expect(handleChange).toHaveBeenLastCalledWith('o');
    });

    it('calls onChange for email input', async () => {
      const handleChange = vi.fn();
      render(<Input type="email" value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test@example.com');

      expect(handleChange).toHaveBeenCalledTimes(16);
    });

    it('calls onChange for password input', async () => {
      const handleChange = vi.fn();
      render(<Input type="password" value="" onChange={handleChange} />);

      const input = document.querySelector('input[type="password"]')!;
      await userEvent.type(input, 'secret123');

      expect(handleChange).toHaveBeenCalledTimes(9);
    });
  });

  describe('disabled state', () => {
    it('does not call onChange when disabled', async () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} disabled={true} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
