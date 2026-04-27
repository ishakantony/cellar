import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from './markdown-editor';

vi.mock('@/components/monaco-editor', () => ({
  MonacoEditor: ({ value, onChange }: { value: string; onChange?: (v: string) => void }) => (
    <textarea value={value} onChange={e => onChange?.(e.target.value)} />
  ),
}));

describe('MarkdownEditor', () => {
  it('renders edit tab by default', () => {
    render(<MarkdownEditor value="hello" onChange={vi.fn()} />);
    expect(screen.getByText('Edit')).toHaveClass('bg-primary/10');
    expect(screen.getByText('Preview')).not.toHaveClass('bg-primary/10');
  });

  it('switches to preview tab', () => {
    render(<MarkdownEditor value="hello" onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByText('Preview')).toHaveClass('bg-primary/10');
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<MarkdownEditor value="" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new text' } });
    expect(onChange).toHaveBeenCalledWith('new text');
  });
});
