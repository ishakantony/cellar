import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { CodeMirrorEditor, SearchInput, SplitPane } from '@cellar/ui';
import type { EditorDiagnostic } from '@cellar/ui';
import { buildJsonTree, type JsonNode, type JsonValue } from '../lib/json-tree';
import { formatJson, minifyJson } from '../lib/json-format';
import { parseJson } from '../lib/json-parse';
import { filterJsonTree } from '../lib/json-tree-filter';
import { JsonTreeView } from '../components/json-tree-view';
import { EditorToolbar } from '../components/editor-toolbar';
import { useJsonDrop } from '../hooks/use-json-drop';

const PLACEHOLDER = 'Paste JSON to begin…';
const PANE_RATIO_KEY = 'cellar:json-explorer:pane-ratio';

/** ~5 MB soft warning threshold (in bytes) */
const SIZE_WARN = 5_000_000;
/** ~50 MB hard rejection threshold (in bytes) */
const SIZE_LIMIT = 50_000_000;

/**
 * Controlled view component. The page is a thin shell around this so tests
 * can drive `value`/`onChange` directly without poking CodeMirror.
 */
export interface JsonExplorerViewProps {
  value: string;
  onChange: (next: string) => void;
}

interface StateCardProps {
  title: string;
  children: ReactNode;
  tone?: 'neutral' | 'warning' | 'error';
  role?: 'note' | 'status' | 'alert';
  label?: string;
  className?: string;
}

function StateCard({
  title,
  children,
  tone = 'neutral',
  role = 'note',
  label,
  className = '',
}: StateCardProps) {
  const toneClass = {
    neutral: 'border-outline-variant/30 bg-surface-container-high/80 text-on-surface',
    warning: 'border-warning/40 bg-warning/10 text-warning',
    error: 'border-error/40 bg-error/10 text-error',
  }[tone];

  return (
    <div
      role={role}
      aria-label={label ?? title}
      className={`rounded-xl border px-4 py-3 shadow-sm shadow-black/10 backdrop-blur ${toneClass} ${className}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest">{title}</p>
      <div className="mt-1 text-xs leading-relaxed">{children}</div>
    </div>
  );
}

export function JsonExplorerView({ value, onChange }: JsonExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const parseResult = useMemo(() => parseJson(value), [value]);
  const byteLength = value.length; // ASCII-safe proxy; good enough for thresholds
  const isTooLarge = byteLength >= SIZE_LIMIT;
  const isLarge = !isTooLarge && byteLength >= SIZE_WARN;

  const tree: JsonNode | null = useMemo(() => {
    if (isTooLarge) return null;
    if (!parseResult.ok || parseResult.value === undefined) return null;
    return buildJsonTree(parseResult.value as JsonValue);
  }, [isTooLarge, parseResult]);

  const filteredTree: JsonNode | null = useMemo(() => {
    if (tree === null) return null;
    if (searchQuery.trim() === '') return tree;
    return filterJsonTree(tree, searchQuery);
  }, [tree, searchQuery]);

  /** Lint diagnostic to show in the CodeMirror gutter when JSON is invalid. */
  const diagnostics: EditorDiagnostic[] = useMemo(() => {
    if (parseResult.ok || value.trim() === '') return [];
    // Compute the `from` offset for the reported line/col
    const lines = value.split('\n');
    const line = Math.max(1, parseResult.line);
    const col = Math.max(1, parseResult.col);
    let from = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      from += lines[i].length + 1; // +1 for the newline
    }
    from += col - 1;
    from = Math.min(from, Math.max(0, value.length - 1));
    return [
      {
        from,
        to: from + 1,
        severity: 'error',
        message: parseResult.message,
      },
    ];
  }, [parseResult, value]);

  const handleFormat = useCallback(() => {
    onChange(formatJson(value));
  }, [value, onChange]);

  const handleMinify = useCallback(() => {
    onChange(minifyJson(value));
  }, [value, onChange]);

  const { isDragOver, dragHandlers } = useJsonDrop({ onChange });

  const documentStatus =
    value.trim() === ''
      ? 'Empty'
      : !parseResult.ok
        ? 'Invalid'
        : isLarge
          ? 'Large'
          : isTooLarge
            ? 'Too large'
            : 'Valid';

  return (
    <section
      role="region"
      aria-label="JSON Explorer workspace"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-container-low shadow-sm"
    >
      <header className="flex flex-col gap-3 border-b border-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Toolbox</p>
          <h1 className="text-lg font-semibold text-on-surface">JSON Explorer</h1>
          <p className="text-xs text-outline">Editor and parsed tree</p>
        </div>
        <div
          role="status"
          aria-label="Document status"
          className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-outline"
        >
          <span className="rounded-full border border-white/10 bg-surface-container px-2.5 py-1">
            {documentStatus}
          </span>
          {value.trim() !== '' && (
            <span className="rounded-full border border-white/10 bg-surface-container px-2.5 py-1">
              {byteLength.toLocaleString()} bytes
            </span>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 p-2 md:p-3">
        <SplitPane
          persistKey={PANE_RATIO_KEY}
          defaultRatio={0.4}
          className="h-full w-full"
          left={
            <section
              role="region"
              aria-label="JSON editor"
              className={[
                'relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-inner transition-colors',
                isDragOver ? 'border-primary/50 bg-surface-container-high' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              {...dragHandlers}
            >
              <EditorToolbar value={value} onFormat={handleFormat} onMinify={handleMinify} />
              <div
                className={[
                  'relative min-h-0 flex-1 bg-surface-container-low/70 transition-colors',
                  '[&_.cm-editor]:bg-transparent [&_.cm-gutters]:bg-surface-container-low/60 [&_.cm-gutters]:backdrop-blur [&_.cm-content]:text-on-surface [&_.cm-activeLine]:bg-primary/5 [&_.cm-activeLineGutter]:bg-primary/10',
                  isDragOver ? 'bg-primary/5' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <CodeMirrorEditor
                  value={value}
                  onChange={onChange}
                  language="json"
                  diagnostics={diagnostics}
                />
                {value === '' && (
                  <div className="pointer-events-none absolute inset-0 flex items-start px-6 pt-5 sm:px-10">
                    <StateCard title="Empty editor" label="Empty editor" className="max-w-sm">
                      <p className="font-mono">{PLACEHOLDER}</p>
                      <p className="mt-1 text-outline">
                        Drop a file or paste JSON to inspect the tree.
                      </p>
                    </StateCard>
                  </div>
                )}
                {isDragOver && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface/30 backdrop-blur-[1px]"
                  >
                    <p className="rounded-xl border border-primary/30 bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface shadow-lg shadow-black/20">
                      Drop JSON file here
                    </p>
                  </div>
                )}
              </div>
            </section>
          }
          right={
            <section
              role="region"
              aria-label="JSON tree"
              className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/5 bg-surface-container-lowest"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 px-3 py-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                    Tree
                  </p>
                  <p className="text-[11px] text-outline">Parsed structure</p>
                </div>
              </div>

              <div className="border-b border-outline-variant/20 px-3 py-2">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search keys and values…"
                  debounceMs={0}
                />
              </div>

              {isTooLarge && (
                <StateCard
                  title="Document too large"
                  label="Document too large"
                  role="alert"
                  tone="error"
                  className="mx-3 mt-2"
                >
                  Document is too large (~{Math.round(byteLength / 1_000_000)} MB). Tree rendering
                  is disabled to avoid freezing the browser. Use a dedicated tool for large files.
                </StateCard>
              )}
              {isLarge && (
                <StateCard
                  title="Large document"
                  label="Large document"
                  role="status"
                  tone="warning"
                  className="mx-3 mt-2"
                >
                  Large document — tree may be slow (~{Math.round(byteLength / 1_000_000)} MB).
                </StateCard>
              )}

              {!parseResult.ok && value.trim() !== '' && (
                <StateCard
                  title="Invalid JSON"
                  label="Invalid JSON"
                  role="alert"
                  tone="error"
                  className="mx-3 mt-2"
                >
                  <p className="mt-0.5 font-mono">{parseResult.message}</p>
                  <p className="mt-0.5 text-outline">
                    Line {parseResult.line}, Col {parseResult.col}
                  </p>
                </StateCard>
              )}

              <div className="flex-1 min-h-0 overflow-auto">
                {!isTooLarge && (
                  <JsonTreeView
                    root={filteredTree}
                    placeholder={
                      parseResult.ok && tree !== null && filteredTree === null ? (
                        'No matches found'
                      ) : (
                        <StateCard
                          title="Empty tree"
                          label="Empty tree"
                          className="mx-auto max-w-sm"
                        >
                          <p className="font-mono">{PLACEHOLDER}</p>
                          <p className="mt-1 text-outline">
                            Parsed keys and values will appear here once the document is valid.
                          </p>
                        </StateCard>
                      )
                    }
                  />
                )}
              </div>
            </section>
          }
        />
      </div>
    </section>
  );
}

/**
 * JSON Explorer page. State is intentionally NOT persisted across refreshes —
 * pane ratio persists via `SplitPane`'s `persistKey` but the editor `text`
 * does not.
 */
export function JsonExplorerPage() {
  const [text, setText] = useState('');
  return (
    <div className="h-full min-h-0 w-full p-2 md:p-4">
      <JsonExplorerView value={text} onChange={setText} />
    </div>
  );
}
