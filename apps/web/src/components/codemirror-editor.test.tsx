import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { EditorView } from '@codemirror/view';
import { CodeMirrorEditor } from './codemirror-editor';

describe('CodeMirrorEditor', () => {
  it('renders the initial value into the editor', () => {
    const { container } = render(<CodeMirrorEditor value="hello world" />);
    expect(container.textContent).toContain('hello world');
  });

  it('calls onChange when the document changes', async () => {
    const onChange = vi.fn();
    const { container } = render(<CodeMirrorEditor value="hello" onChange={onChange} />);

    const editorEl = container.querySelector('.cm-editor');
    const view = EditorView.findFromDOM(editorEl as HTMLElement)!;

    act(() => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: 'hello world' },
      });
    });

    expect(onChange).toHaveBeenCalledWith('hello world');
  });

  it('does not call onChange in readOnly mode', async () => {
    const onChange = vi.fn();
    const { container } = render(<CodeMirrorEditor value="hello" onChange={onChange} readOnly />);

    const editorEl = container.querySelector('.cm-editor');
    const view = EditorView.findFromDOM(editorEl as HTMLElement)!;

    act(() => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: 'hello world' },
      });
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
