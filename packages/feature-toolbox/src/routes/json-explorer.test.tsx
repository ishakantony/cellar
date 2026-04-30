import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react';
import { JsonExplorerPage, JsonExplorerView } from './json-explorer';

vi.mock('@cellar/ui', async () => {
  const actual = await vi.importActual<typeof import('@cellar/ui')>('@cellar/ui');
  return {
    ...actual,
    CodeMirrorEditor: ({ diagnostics = [] }: { diagnostics?: Array<{ message: string }> }) => (
      <div className="cm-editor">
        {diagnostics.length > 0 && (
          <div role="status" aria-label="Editor diagnostics">
            {diagnostics.map(diagnostic => diagnostic.message).join('\n')}
          </div>
        )}
      </div>
    ),
  };
});

describe('JsonExplorerPage', () => {
  it('renders the explorer as a framed workspace with editor and tree panes', () => {
    render(<JsonExplorerPage />);
    expect(screen.getByRole('region', { name: /json explorer workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /json explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /json editor/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /json tree/i })).toBeInTheDocument();
    // Split pane separator
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^tree$/i })).not.toBeInTheDocument();
  });

  it('keeps pane-ratio persistence without persisting editor text', () => {
    window.localStorage.setItem('cellar:json-explorer:pane-ratio', '0.7');
    window.localStorage.setItem('cellar:json-explorer:text', '{"leaked":true}');

    const { container } = render(<JsonExplorerPage />);

    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '70');
    expect(container.textContent).toMatch(/Paste JSON to begin/i);
    expect(container.textContent).not.toContain('leaked');
  });

  it('shows a placeholder in the right pane when the editor is empty', () => {
    const { container } = render(<JsonExplorerPage />);
    const right = container.querySelector('[data-slot="right"]') as HTMLElement;
    expect(right).toBeTruthy();
    expect(right.textContent).toMatch(/Paste JSON to begin/i);
  });
});

function getRightPane(container: HTMLElement): HTMLElement {
  const right = container.querySelector('[data-slot="right"]') as HTMLElement;
  if (!right) throw new Error('right pane not found');
  return right;
}

function getDocumentStatus(): HTMLElement {
  return screen.getByRole('status', { name: /document status/i });
}

describe('JsonExplorerView', () => {
  it.each([
    { value: '', status: /empty/i },
    { value: '{"name":"Ada"}', status: /valid/i },
    { value: 'not-valid-json', status: /invalid/i },
  ])('shows $status in the workspace header', ({ value, status }) => {
    render(<JsonExplorerView value={value} onChange={() => {}} />);

    expect(within(getDocumentStatus()).getByText(status)).toBeInTheDocument();
  });

  it('shows empty editor and tree guidance as state cards', () => {
    render(<JsonExplorerView value="" onChange={() => {}} />);

    const editorPane = screen.getByRole('region', { name: /json editor/i });
    const treePane = screen.getByRole('region', { name: /json tree/i });

    expect(within(editorPane).getByRole('note', { name: /empty editor/i })).toHaveTextContent(
      /paste json to begin/i
    );
    expect(within(treePane).getByRole('note', { name: /empty tree/i })).toHaveTextContent(
      /paste json to begin/i
    );
  });

  it('renders the tree when value parses', () => {
    const { container } = render(<JsonExplorerView value='{"name":"Ada"}' onChange={() => {}} />);
    const right = getRightPane(container);
    expect(right.textContent).toContain('name');
    expect(right.textContent).toContain('"Ada"');
  });

  it('renders an error card when JSON is invalid', () => {
    render(<JsonExplorerView value="not-valid-json" onChange={() => {}} />);
    const alert = screen.getByRole('alert', { name: /invalid json/i });
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/invalid json/i);
    expect(alert).toHaveTextContent(/line 1, col 1/i);
    expect(screen.getByRole('status', { name: /editor diagnostics/i })).toHaveTextContent(
      /unexpected|not valid/i
    );
  });

  it('shows warning-sized documents in the workspace header', () => {
    const warningSizedJson = JSON.stringify({ payload: 'a'.repeat(5_000_000) });
    render(<JsonExplorerView value={warningSizedJson} onChange={() => {}} />);

    const workspace = screen.getByRole('region', { name: /json explorer workspace/i });
    const documentStatus = within(workspace).getByRole('status', { name: /document status/i });
    expect(within(documentStatus).getByText(/large/i)).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /large document/i })).toHaveTextContent(
      /tree may be slow/i
    );
  });

  it('disables tree rendering for documents over the hard size limit', () => {
    const tooLargeJson = JSON.stringify({ payload: 'a'.repeat(50_000_000) });
    render(<JsonExplorerView value={tooLargeJson} onChange={() => {}} />);

    expect(screen.getByRole('alert', { name: /document too large/i })).toHaveTextContent(
      /tree rendering is disabled/i
    );
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
  });

  it('updates the tree when controlled value changes', () => {
    const { container, rerender } = render(<JsonExplorerView value="" onChange={() => {}} />);
    const right = getRightPane(container);
    expect(right.textContent).not.toContain('name');

    act(() => {
      rerender(<JsonExplorerView value='{"name":"Ada"}' onChange={() => {}} />);
    });

    expect(right.textContent).toContain('name');
  });

  it('labels the right pane as the JSON tree', () => {
    render(<JsonExplorerView value="" onChange={() => {}} />);
    expect(screen.getByRole('region', { name: /json tree/i })).toBeInTheDocument();
    expect(screen.getByText('Tree')).toBeInTheDocument();
  });

  it('scopes shared tree search to the tree pane and filters rendered results', async () => {
    render(
      <JsonExplorerView
        value='{"name":"Ada","city":"Paris","nested":{"language":"TypeScript"}}'
        onChange={() => {}}
      />
    );

    const treePane = screen.getByRole('region', { name: /json tree/i });
    expect(within(treePane).getByText('Tree')).toBeInTheDocument();
    expect(within(treePane).queryByRole('tab')).not.toBeInTheDocument();

    const search = within(treePane).getByRole('textbox', { name: /search/i });
    fireEvent.change(search, { target: { value: 'city' } });

    await waitFor(() => {
      expect(within(treePane).getByText('city')).toBeInTheDocument();
      expect(within(treePane).queryByText('name')).not.toBeInTheDocument();
    });

    fireEvent.click(within(treePane).getByRole('button', { name: /clear search/i }));

    await waitFor(() => {
      expect(within(treePane).getByText('name')).toBeInTheDocument();
      expect(within(treePane).getByText('nested')).toBeInTheDocument();
    });
  });
});

describe('JsonExplorerView interactions', () => {
  it('mounts a CodeMirror editor in the left pane', () => {
    const { container } = render(<JsonExplorerView value="" onChange={() => {}} />);
    expect(container.querySelector('.cm-editor')).toBeTruthy();
  });

  it('keeps editor toolbar actions and drop prompt in the editor pane', () => {
    render(<JsonExplorerView value='{"name":"Ada"}' onChange={() => {}} />);

    const editorPane = screen.getByRole('region', { name: /json editor/i });
    const toolbar = within(editorPane).getByRole('toolbar', { name: /editor actions/i });
    expect(within(toolbar).getByRole('button', { name: /format/i })).toBeInTheDocument();
    expect(within(toolbar).getByRole('button', { name: /minify/i })).toBeInTheDocument();
    expect(within(toolbar).getByRole('button', { name: /copy/i })).toBeInTheDocument();

    fireEvent.dragEnter(editorPane);

    expect(within(editorPane).getByText(/drop json file here/i)).toBeInTheDocument();
  });

  it('expands long string truncation on click', () => {
    const long = 'y'.repeat(200);
    const json = JSON.stringify({ msg: long });
    const { container } = render(<JsonExplorerView value={json} onChange={() => {}} />);
    const right = getRightPane(container);

    const truncated = within(right).getByText(/^"y{1,150}\.\.\."$/);
    expect(truncated).toBeInTheDocument();
    fireEvent.click(truncated);
    expect(within(right).getByText(`"${long}"`)).toBeInTheDocument();
  });
});
