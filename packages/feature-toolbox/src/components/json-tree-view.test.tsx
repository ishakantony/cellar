import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { buildJsonTree } from '../lib/json-tree';
import { JsonTreeView } from './json-tree-view';

describe('JsonTreeView', () => {
  it('renders a placeholder when root is null', () => {
    render(<JsonTreeView root={null} placeholder="Paste JSON to begin..." />);
    expect(screen.getByText('Paste JSON to begin...')).toBeInTheDocument();
  });

  it('renders rows for primitive children of an object', () => {
    const tree = buildJsonTree({ name: 'Ada', age: 36, admin: true });
    render(<JsonTreeView root={tree} />);
    expect(screen.getByText('name')).toBeInTheDocument();
    // String values render with quotes
    expect(screen.getByText('"Ada"')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('renders type badges for primitive children', () => {
    const tree = buildJsonTree({ a: 'x', b: 1, c: true, d: null });
    render(<JsonTreeView root={tree} />);
    expect(screen.getByText('# str')).toBeInTheDocument();
    expect(screen.getByText('# num')).toBeInTheDocument();
    expect(screen.getByText('# bool')).toBeInTheDocument();
    expect(screen.getByText('# null')).toBeInTheDocument();
  });

  it('keeps tree rows named with their key, type, and value for scanning', () => {
    const tree = buildJsonTree({ name: 'Ada' });
    render(<JsonTreeView root={tree} />);

    expect(screen.getByRole('treeitem', { name: /name # str "Ada"/i })).toBeInTheDocument();
  });

  it('renders count badges for arrays and objects', () => {
    const tree = buildJsonTree({ list: [1, 2, 3], nested: { a: 1, b: 2, c: 3, d: 4 } });
    render(<JsonTreeView root={tree} />);
    expect(screen.getByText('[3]')).toBeInTheDocument();
    // root has 2 children -> {2}; nested has 4 children -> {4}
    expect(screen.getByText('{2}')).toBeInTheDocument();
    expect(screen.getByText('{4}')).toBeInTheDocument();
  });

  it('renders empty array and empty object with zero count', () => {
    const tree = buildJsonTree({ a: [], b: {} });
    render(<JsonTreeView root={tree} />);
    expect(screen.getByText('[0]')).toBeInTheDocument();
    expect(screen.getByText('{0}')).toBeInTheDocument();
  });

  it('expands the root by default and collapses deeper levels', () => {
    const tree = buildJsonTree({ outer: { inner: 'value' } });
    render(<JsonTreeView root={tree} />);
    // outer key is visible (root expanded)
    expect(screen.getByText('outer')).toBeInTheDocument();
    // inner key is NOT yet visible (outer is collapsed by default)
    expect(screen.queryByText('inner')).toBeNull();
  });

  it('toggles children visibility when caret is clicked', () => {
    const tree = buildJsonTree({ outer: { inner: 'value' } });
    render(<JsonTreeView root={tree} />);

    // Find the caret button for `outer` (the second toggle — first is the root toggle)
    const carets = screen.getAllByRole('button', { name: /toggle/i });
    // root caret + outer caret -> 2 carets
    expect(carets.length).toBeGreaterThanOrEqual(2);
    const outerCaret = carets[1];
    fireEvent.click(outerCaret);

    expect(screen.getByText('inner')).toBeInTheDocument();
    expect(screen.getByText('"value"')).toBeInTheDocument();

    fireEvent.click(outerCaret);
    expect(screen.queryByText('inner')).toBeNull();
  });

  it('truncates long string values and expands on click', () => {
    const long = 'x'.repeat(200);
    const tree = buildJsonTree({ msg: long });
    render(<JsonTreeView root={tree} />);

    // The full string is NOT in the document yet
    expect(screen.queryByText(`"${long}"`)).toBeNull();
    // A truncated form (ending with ellipsis) is rendered
    const truncatedEl = screen.getByText(/^"x{1,150}\.\.\."$/);
    expect(truncatedEl).toBeInTheDocument();

    fireEvent.click(truncatedEl);
    expect(screen.getByText(`"${long}"`)).toBeInTheDocument();
  });

  it('does not render a caret on empty containers', () => {
    const tree = buildJsonTree({ empty: [] });
    render(<JsonTreeView root={tree} />);
    // Only the root has a caret (because root has 1 child); empty array has none.
    const carets = screen.getAllByRole('button', { name: /toggle/i });
    expect(carets).toHaveLength(1);
  });
});
