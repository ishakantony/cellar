import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders with placeholder', () => {
    render(<Textarea value="" onChange={vi.fn()} placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<Textarea value="" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('shows error state', () => {
    render(<Textarea value="" onChange={vi.fn()} error="Required" />);
    expect(screen.getByRole('textbox')).toHaveClass('ring-error');
  });
});
