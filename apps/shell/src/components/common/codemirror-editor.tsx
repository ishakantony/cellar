import { useEffect, useRef } from 'react';
import {
  EditorView,
  keymap,
  lineNumbers,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
} from '@codemirror/language';
import { getLanguageExtension } from '@/lib/codemirror-languages';

const appTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    backgroundColor: 'var(--color-surface-container-lowest, #0f0f13)',
  },
  '.cm-scroller': { overflow: 'auto', lineHeight: '1.7' },
  '.cm-content': {
    padding: '16px 0',
    caretColor: 'var(--color-primary, #aac7ff)',
    color: 'var(--color-on-surface, #e1e2e8)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-cursor': { borderLeftColor: 'var(--color-primary, #aac7ff)' },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface-container-lowest, #0f0f13)',
    color: 'var(--color-outline, #8e9099)',
    border: 'none',
    borderRight:
      '1px solid color-mix(in srgb, var(--color-outline-variant, #43464e) 20%, transparent)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--color-primary, #aac7ff) 8%, transparent)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--color-primary, #aac7ff) 5%, transparent)',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor:
      'color-mix(in srgb, var(--color-primary, #aac7ff) 20%, transparent) !important',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 12px 0 8px' },
});

export interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  lineNumbers?: boolean;
}

export function CodeMirrorEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  lineNumbers: showLineNumbers = true,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged && !readOnly) {
        onChangeRef.current?.(update.state.doc.toString());
      }
    });

    const extensions = [
      updateListener,
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      syntaxHighlighting(defaultHighlightStyle),
      bracketMatching(),
      indentOnInput(),
      drawSelection(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      EditorState.readOnly.of(readOnly),
      appTheme,
      ...(showLineNumbers ? [lineNumbers()] : []),
      getLanguageExtension(language),
    ].flat();

    const view = new EditorView({
      state: EditorState.create({ doc: value, extensions }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Intentionally excluding `value` and `onChange` — they are synced separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly, showLineNumbers]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  return <div ref={containerRef} className="h-full" />;
}
