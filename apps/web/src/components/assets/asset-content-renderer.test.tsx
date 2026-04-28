import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetContentRenderer } from './asset-content-renderer';

vi.mock('@/components/codemirror-editor', () => ({
  CodeMirrorEditor: ({
    value,
    readOnly,
  }: {
    value: string;
    readOnly?: boolean;
    language?: string;
  }) => (
    <div data-testid="cm-editor" data-readonly={readOnly}>
      {value}
    </div>
  ),
}));

vi.mock('@/components/markdown-preview', () => ({
  MarkdownPreview: ({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const snippetAsset = {
  type: 'SNIPPET' as const,
  content: 'const x = 1;',
  language: 'javascript',
  url: null,
  filePath: null,
  fileName: null,
  mimeType: null,
  fileSize: null,
};

const promptAsset = {
  type: 'PROMPT' as const,
  content: '# Hello',
  language: null,
  url: null,
  filePath: null,
  fileName: null,
  mimeType: null,
  fileSize: null,
};

describe('AssetContentRenderer — snippet', () => {
  it('renders CodeMirrorEditor in read-only mode', () => {
    render(<AssetContentRenderer asset={snippetAsset} />);
    const editor = screen.getByTestId('cm-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('data-readonly', 'true');
  });

  it('shows language label and copy button', () => {
    render(<AssetContentRenderer asset={snippetAsset} />);
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });
});

describe('AssetContentRenderer — prompt/note', () => {
  it('shows Preview tab active by default', () => {
    render(<AssetContentRenderer asset={promptAsset} />);
    expect(screen.getByRole('button', { name: /preview/i })).toHaveClass('bg-primary/10');
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('switches to Source tab showing read-only CodeMirrorEditor', () => {
    render(<AssetContentRenderer asset={promptAsset} />);
    fireEvent.click(screen.getByRole('button', { name: /source/i }));
    const editor = screen.getByTestId('cm-editor');
    expect(editor).toHaveAttribute('data-readonly', 'true');
  });
});
