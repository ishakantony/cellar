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
  it('renders the explorer as a full-page tool with header and split panes', () => {
    render(<JsonExplorerPage />);
    expect(screen.getByRole('region', { name: /^json explorer$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /json explorer/i })).toBeInTheDocument();
    expect(screen.getByText(/paste, format, and inspect json/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /json editor/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /json viewer/i })).toBeInTheDocument();
    // Split pane separator
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^viewer$/i })).not.toBeInTheDocument();
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
    expect(right.textContent).toMatch(/Parsed keys and values/i);
  });
});

function getRightPane(container: HTMLElement): HTMLElement {
  const right = container.querySelector('[data-slot="right"]') as HTMLElement;
  if (!right) throw new Error('right pane not found');
  return right;
}

describe('JsonExplorerView', () => {
  it('shows simple empty editor and viewer guidance', () => {
    render(<JsonExplorerView value="" onChange={() => {}} />);

    const editorPane = screen.getByRole('region', { name: /json editor/i });
    const viewerPane = screen.getByRole('region', { name: /json viewer/i });

    expect(within(editorPane).getByText(/paste json to begin/i)).toBeInTheDocument();
    expect(within(viewerPane).getByText(/parsed keys and values/i)).toBeInTheDocument();
    expect(screen.queryByRole('note', { name: /empty editor/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('note', { name: /empty tree/i })).not.toBeInTheDocument();
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

  it('shows warning-sized documents in the viewer', () => {
    const warningSizedJson = JSON.stringify({ payload: 'a'.repeat(5_000_000) });
    render(<JsonExplorerView value={warningSizedJson} onChange={() => {}} />);

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

  it('labels the right pane as the JSON viewer', () => {
    render(<JsonExplorerView value="" onChange={() => {}} />);
    expect(screen.getByRole('region', { name: /json viewer/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /search/i })).toHaveAttribute(
      'placeholder',
      'Filter nodes...'
    );
  });

  it('scopes shared tree search to the viewer pane and filters rendered results', async () => {
    render(
      <JsonExplorerView
        value='{"name":"Ada","city":"Paris","nested":{"language":"TypeScript"}}'
        onChange={() => {}}
      />
    );

    const viewerPane = screen.getByRole('region', { name: /json viewer/i });
    expect(within(viewerPane).queryByRole('tab')).not.toBeInTheDocument();

    const search = within(viewerPane).getByRole('textbox', { name: /search/i });
    fireEvent.change(search, { target: { value: 'city' } });

    await waitFor(() => {
      expect(within(viewerPane).getByText('city')).toBeInTheDocument();
      expect(within(viewerPane).queryByText('name')).not.toBeInTheDocument();
    });

    fireEvent.click(within(viewerPane).getByRole('button', { name: /clear search/i }));

    await waitFor(() => {
      expect(within(viewerPane).getByText('name')).toBeInTheDocument();
      expect(within(viewerPane).getByText('nested')).toBeInTheDocument();
    });
  });

  it('expands and collapses all visible tree nodes from the viewer header', () => {
    render(
      <JsonExplorerView
        value='{"settings":{"theme":"dark","nested":{"enabled":true}},"items":[1]}'
        onChange={() => {}}
      />
    );

    const viewerPane = screen.getByRole('region', { name: /json viewer/i });
    expect(within(viewerPane).getByRole('button', { name: /collapse all/i })).toBeInTheDocument();
    expect(within(viewerPane).getByRole('button', { name: /expand all/i })).toBeInTheDocument();
    expect(within(viewerPane).getByText('enabled')).toBeInTheDocument();

    fireEvent.click(within(viewerPane).getByRole('button', { name: /collapse all/i }));
    expect(within(viewerPane).queryByText('settings')).not.toBeInTheDocument();
    expect(within(viewerPane).queryByText('enabled')).not.toBeInTheDocument();

    fireEvent.click(within(viewerPane).getByRole('button', { name: /expand all/i }));
    expect(within(viewerPane).getByText('enabled')).toBeInTheDocument();
    expect(within(viewerPane).getByText('true')).toBeInTheDocument();
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
