import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Base64Page, Base64View } from './base64';

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
});

function getInput(): HTMLTextAreaElement {
  return screen.getByPlaceholderText(/enter text or base64/i) as HTMLTextAreaElement;
}

function getOutput(): HTMLTextAreaElement {
  return screen.getByPlaceholderText(/output will appear/i) as HTMLTextAreaElement;
}

describe('Base64Page', () => {
  it('renders the base64 tool with header, textareas, and action buttons', () => {
    render(<Base64Page />);

    expect(screen.getByRole('region', { name: /^base64$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /base64/i })).toBeInTheDocument();
    expect(getInput()).toBeInTheDocument();
    expect(getOutput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /encode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /swap/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('encodes input to base64 when the Encode button is clicked', () => {
    render(<Base64Page />);

    fireEvent.change(getInput(), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /encode/i }));

    expect(getOutput().value).toBe('aGVsbG8=');
  });

  it('decodes base64 input back to text when the Decode button is clicked', () => {
    render(<Base64Page />);

    fireEvent.change(getInput(), { target: { value: 'aGVsbG8=' } });
    fireEvent.click(screen.getByRole('button', { name: /decode/i }));

    expect(getOutput().value).toBe('hello');
  });

  it('shows an error in output when decoding invalid base64', () => {
    render(<Base64Page />);

    fireEvent.change(getInput(), { target: { value: '!!invalid!!' } });
    fireEvent.click(screen.getByRole('button', { name: /decode/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('swaps output into input when Swap is clicked', () => {
    render(<Base64Page />);

    fireEvent.change(getInput(), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /encode/i }));
    fireEvent.click(screen.getByRole('button', { name: /swap/i }));

    expect(getInput().value).toBe('aGVsbG8=');
  });

  it('clears both input and output when Clear is clicked', () => {
    render(<Base64Page />);

    fireEvent.change(getInput(), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /encode/i }));
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    expect(getInput().value).toBe('');
    expect(getOutput().value).toBe('');
  });

  it('copies output to clipboard when Copy is clicked', () => {
    render(<Base64Page />);

    fireEvent.change(getInput(), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /encode/i }));
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('aGVsbG8=');
  });
});

describe('Base64View', () => {
  it('calls onInputChange when input changes', () => {
    const onInputChange = vi.fn();
    render(<Base64View input="" output="" onInputChange={onInputChange} />);

    fireEvent.change(getInput(), { target: { value: 'test' } });
    expect(onInputChange).toHaveBeenCalledWith('test');
  });
});
