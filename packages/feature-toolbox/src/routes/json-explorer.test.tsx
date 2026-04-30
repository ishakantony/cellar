import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { act } from 'react';
import { JsonExplorerPage, JsonExplorerView } from './json-explorer';

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

describe('JsonExplorerView', () => {
  it('shows placeholder when value is empty', () => {
    const { container } = render(<JsonExplorerView value="" onChange={() => {}} />);
    const right = getRightPane(container);
    expect(right.textContent).toMatch(/Paste JSON to begin/i);
  });

  it('renders the tree when value parses', () => {
    const { container } = render(<JsonExplorerView value='{"name":"Ada"}' onChange={() => {}} />);
    const right = getRightPane(container);
    expect(right.textContent).toContain('name');
    expect(right.textContent).toContain('"Ada"');
  });

  it('renders an error card when JSON is invalid', () => {
    render(<JsonExplorerView value="not-valid-json" onChange={() => {}} />);
    // #013: invalid JSON shows an error card with role="alert"
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/invalid json/i);
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
});

describe('JsonExplorerView interactions', () => {
  it('mounts a CodeMirror editor in the left pane', () => {
    const { container } = render(<JsonExplorerView value="" onChange={() => {}} />);
    expect(container.querySelector('.cm-editor')).toBeTruthy();
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
