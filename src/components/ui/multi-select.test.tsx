import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelect } from './multi-select';

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('MultiSelect', () => {
  it('renders empty state', () => {
    render(<MultiSelect options={OPTIONS} selected={[]} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Select...')).toBeInTheDocument();
  });

  it('renders selected chips', () => {
    render(<MultiSelect options={OPTIONS} selected={['a']} onChange={vi.fn()} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('opens dropdown on focus', () => {
    render(<MultiSelect options={OPTIONS} selected={[]} onChange={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('selects an option on click', () => {
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} selected={[]} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('filters options on type', () => {
    render(<MultiSelect options={OPTIONS} selected={[]} onChange={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'B' } });
    expect(screen.queryByText('Option A')).not.toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('selects an option on click', () => {
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} selected={[]} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.click(screen.getByText('Option B'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('removes a chip on click', () => {
    const onChange = vi.fn();
    render(<MultiSelect options={OPTIONS} selected={['a', 'b']} onChange={onChange} />);
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('filters options on type', () => {
    render(<MultiSelect options={OPTIONS} selected={[]} onChange={vi.fn()} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'B' } });
    expect(screen.queryByText('Option A')).not.toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });
});
