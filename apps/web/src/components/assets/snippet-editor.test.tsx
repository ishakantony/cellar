import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SnippetEditor } from './snippet-editor';

vi.mock('@/components/common/codemirror-editor', () => ({
  CodeMirrorEditor: ({ value, onChange }: { value: string; onChange?: (v: string) => void }) => (
    <textarea data-testid="cm-editor" value={value} onChange={e => onChange?.(e.target.value)} />
  ),
}));

vi.mock('prettier/standalone', () => ({
  format: vi.fn().mockResolvedValue('formatted code'),
}));
vi.mock('prettier/plugins/babel', () => ({ default: {} }));
vi.mock('prettier/plugins/estree', () => ({ default: {} }));
vi.mock('prettier/plugins/typescript', () => ({ default: {} }));
vi.mock('prettier/plugins/html', () => ({ default: {} }));
vi.mock('prettier/plugins/postcss', () => ({ default: {} }));
vi.mock('prettier/plugins/markdown', () => ({ default: {} }));
vi.mock('prettier/plugins/yaml', () => ({ default: {} }));

describe('SnippetEditor', () => {
  it('renders language selector and Format button', () => {
    render(
      <SnippetEditor value="" onChange={vi.fn()} language="javascript" onLanguageChange={vi.fn()} />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
  });

  it('Format button is enabled for javascript', () => {
    render(
      <SnippetEditor value="" onChange={vi.fn()} language="javascript" onLanguageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /format/i })).not.toBeDisabled();
  });

  it('Format button is disabled for unsupported languages like go', () => {
    render(
      <SnippetEditor
        value="package main"
        onChange={vi.fn()}
        language="go"
        onLanguageChange={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /format/i })).toBeDisabled();
  });

  it('calls onChange with formatted code when Format is clicked', async () => {
    const prettier = await import('prettier/standalone');
    vi.mocked(prettier.format).mockResolvedValue('const x = 1;');

    const onChange = vi.fn();
    render(
      <SnippetEditor
        value="const x=1"
        onChange={onChange}
        language="javascript"
        onLanguageChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /format/i }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('const x = 1;'));
  });
});
