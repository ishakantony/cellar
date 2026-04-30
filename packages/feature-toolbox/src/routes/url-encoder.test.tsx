import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UrlEncoderPage } from './url-encoder';

// Clipboard API is not available in happy-dom; stub it per test as needed.
const clipboardWriteText = vi.fn(() => Promise.resolve());
Object.defineProperty(globalThis, 'navigator', {
  value: { clipboard: { writeText: clipboardWriteText } },
  writable: true,
});

beforeEach(() => {
  clipboardWriteText.mockClear();
});

describe('UrlEncoderPage', () => {
  it('renders the heading and description', () => {
    render(<UrlEncoderPage />);
    expect(screen.getByRole('heading', { name: /url encoder/i })).toBeInTheDocument();
    expect(screen.getByText(/encodeURIComponent/)).toBeInTheDocument();
  });

  it('disables Encode and Decode buttons when input is empty', () => {
    render(<UrlEncoderPage />);
    expect(screen.getByRole('button', { name: /^encode$/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^decode$/i })).toBeDisabled();
  });

  it('enables Encode and Decode buttons once the user types in the input', () => {
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello world' } });
    expect(screen.getByRole('button', { name: /^encode$/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /^decode$/i })).toBeEnabled();
  });

  it('shows encodeURIComponent output after clicking Encode', () => {
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), {
      target: { value: 'hello world/path?q=1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }));
    expect(screen.getByLabelText(/encoded.*decoded.*output/i)).toHaveValue(
      'hello%20world%2Fpath%3Fq%3D1'
    );
  });

  it('shows decodeURIComponent output after clicking Decode', () => {
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello%20world' } });
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }));
    expect(screen.getByLabelText(/encoded.*decoded.*output/i)).toHaveValue('hello world');
  });

  it('shows an error alert when Decode is given malformed percent-encoding', () => {
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'bad%ZZvalue' } });
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }));
    expect(screen.getByRole('alert', { name: /invalid encoding/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/encoded.*decoded.*output/i)).toHaveValue('');
  });

  it('Copy button writes the output to the clipboard', async () => {
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello world' } });
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }));

    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(clipboardWriteText).toHaveBeenCalledWith('hello%20world');
  });

  it('Copy button shows "Copied" feedback then reverts after 1.5 s', async () => {
    vi.useFakeTimers();
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy/i }));
      await Promise.resolve(); // flush clipboard promise
    });

    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.queryByRole('button', { name: /copied/i })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('output area is always visible, empty before any operation', () => {
    render(<UrlEncoderPage />);
    expect(screen.getByLabelText(/encoded.*decoded.*output/i)).toHaveValue('');
  });

  it('Copy and Swap buttons are disabled before any operation', () => {
    render(<UrlEncoderPage />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /swap/i })).toBeDisabled();
  });

  it('Swap button moves the output into the input and clears the output', () => {
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello world' } });
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }));

    expect(screen.getByLabelText(/encoded.*decoded.*output/i)).toHaveValue('hello%20world');

    fireEvent.click(screen.getByRole('button', { name: /swap/i }));

    expect(screen.getByLabelText(/^input$/i)).toHaveValue('hello%20world');
    expect(screen.getByLabelText(/encoded.*decoded.*output/i)).toHaveValue('');
  });

  it('clears the error card when Encode is clicked after a failed Decode', () => {
    render(<UrlEncoderPage />);
    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'bad%ZZ' } });
    fireEvent.click(screen.getByRole('button', { name: /^decode$/i }));
    expect(screen.getByRole('alert', { name: /invalid encoding/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^input$/i), { target: { value: 'hello world' } });
    fireEvent.click(screen.getByRole('button', { name: /^encode$/i }));
    expect(screen.queryByRole('alert', { name: /invalid encoding/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/encoded.*decoded.*output/i)).toHaveValue('hello%20world');
  });
});
