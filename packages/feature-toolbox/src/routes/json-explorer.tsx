import { useCallback, useMemo, useState } from 'react';
import { CodeMirrorEditor, SplitPane } from '@cellar/ui';
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

export function JsonExplorerView({ value, onChange }: JsonExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const parseResult = useMemo(() => parseJson(value), [value]);

  const tree: JsonNode | null = useMemo(() => {
    if (!parseResult.ok || parseResult.value === undefined) return null;
    return buildJsonTree(parseResult.value as JsonValue);
  }, [parseResult]);

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

  const byteLength = value.length; // ASCII-safe proxy; good enough for thresholds
  const isTooLarge = byteLength >= SIZE_LIMIT;
  const isLarge = !isTooLarge && byteLength >= SIZE_WARN;
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
              className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/5 bg-surface-container-lowest"
            >
              <EditorToolbar value={value} onFormat={handleFormat} onMinify={handleMinify} />
              <div
                className={[
                  'relative min-h-0 flex-1 transition-colors',
                  isDragOver ? 'outline outline-2 outline-primary/60 bg-primary/5' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                {...dragHandlers}
              >
                <CodeMirrorEditor
                  value={value}
                  onChange={onChange}
                  language="json"
                  diagnostics={diagnostics}
                />
                {value === '' && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-start px-12 pt-4 text-xs text-outline font-mono"
                  >
                    {PLACEHOLDER}
                  </div>
                )}
                {isDragOver && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <p className="rounded-md bg-surface-container px-4 py-2 text-sm text-on-surface shadow">
                      Drop .json file here
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

              {/* Search input */}
              <div className="border-b border-outline-variant/20 px-3 py-2">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search keys and values…"
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-2.5 py-1.5 text-xs text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
                  aria-label="Search JSON tree"
                />
              </div>

              {/* Size banners */}
              {isTooLarge && (
                <div
                  role="alert"
                  className="mx-3 mt-2 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-xs text-error"
                >
                  Document is too large (~{Math.round(byteLength / 1_000_000)} MB). Tree rendering
                  is disabled to avoid freezing the browser. Use a dedicated tool for large files.
                </div>
              )}
              {isLarge && (
                <div
                  role="status"
                  className="mx-3 mt-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
                >
                  Large document — tree may be slow (~{Math.round(byteLength / 1_000_000)} MB).
                </div>
              )}

              {/* Invalid JSON error card */}
              {!parseResult.ok && value.trim() !== '' && (
                <div
                  role="alert"
                  className="mx-3 mt-2 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-xs text-error"
                >
                  <p className="font-semibold">Invalid JSON</p>
                  <p className="mt-0.5 font-mono">{parseResult.message}</p>
                  <p className="mt-0.5 text-outline">
                    Line {parseResult.line}, Col {parseResult.col}
                  </p>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-auto">
                {!isTooLarge && (
                  <JsonTreeView
                    root={filteredTree}
                    placeholder={
                      parseResult.ok && tree !== null && filteredTree === null
                        ? 'No matches found'
                        : PLACEHOLDER
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
