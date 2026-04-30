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
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint';
import { getLanguageExtension } from '../lib/codemirror-languages';

/** A single lint diagnostic to display in the editor gutter. */
export interface EditorDiagnostic {
  /** Absolute character offset for the start of the offending region. */
  from: number;
  /** Absolute character offset for the end. If omitted, `from + 1` is used. */
  to?: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

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
  /**
   * Optional list of diagnostics to display in the lint gutter.
   * Changing this prop causes a live re-lint without rebuilding the editor.
   */
  diagnostics?: EditorDiagnostic[];
}

export function CodeMirrorEditor({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  lineNumbers: showLineNumbers = true,
  diagnostics,
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  // Keep a mutable ref so the linter closure always reads the latest diagnostics
  // without requiring the editor to be rebuilt.
  const diagnosticsRef = useRef<EditorDiagnostic[] | undefined>(diagnostics);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    diagnosticsRef.current = diagnostics;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged && !readOnly) {
        onChangeRef.current?.(update.state.doc.toString());
      }
    });

    // Linter that reads from the diagnosticsRef so it always sees latest values.
    const linterExtension = linter(
      (): Diagnostic[] => {
        const diags = diagnosticsRef.current;
        if (!diags || diags.length === 0) return [];
        return diags.map(d => ({
          from: d.from,
          to: d.to ?? d.from + 1,
          severity: d.severity,
          message: d.message,
        }));
      },
      { delay: 0 }
    );

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
      lintGutter(),
      linterExtension,
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
    // Intentionally excluding `value`, `onChange`, `diagnostics` — they are synced separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly, showLineNumbers]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  // When diagnostics change, force the linter to re-run
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    // Dispatch an empty transaction to trigger the update listener → linter re-run
    // The standard way is to use forceLinting from @codemirror/lint.
    import('@codemirror/lint')
      .then(({ forceLinting }) => {
        if (viewRef.current) forceLinting(viewRef.current);
      })
      .catch(() => {
        /* ignore */
      });
  }, [diagnostics]);

  return <div ref={containerRef} className="h-full" />;
}
