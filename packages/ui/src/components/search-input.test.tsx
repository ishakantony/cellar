import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search collections..." />);
    expect(screen.getByLabelText('Search')).toHaveAttribute('placeholder', 'Search collections...');
  });

  it('typing triggers onChange after debounce', async () => {
    const handleChange = vi.fn();
    render(<SearchInput value="" onChange={handleChange} debounceMs={50} />);

    const input = screen.getByLabelText('Search');
    await userEvent.type(input, 'hello');

    // Should not be called immediately
    expect(handleChange).not.toHaveBeenCalledWith('hello');

    // Wait for debounce
    await new Promise(r => setTimeout(r, 100));
    expect(handleChange).toHaveBeenCalledWith('hello');
  });

  it('clear button resets value and calls onChange', async () => {
    const handleChange = vi.fn();
    render(<SearchInput value="hello" onChange={handleChange} />);

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await userEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when value is empty', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });
});
