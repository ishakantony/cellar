import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Button, CodeMirrorEditor, SearchInput, SplitPane } from '@cellar/ui';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
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
  const [expandAllSignal, setExpandAllSignal] = useState(0);
  const [collapseAllSignal, setCollapseAllSignal] = useState(0);

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

  return (
    <section
      role="region"
      aria-label="JSON Explorer"
      className="flex h-full min-h-0 w-full flex-col space-y-4 overflow-hidden bg-surface"
    >
      <header>
        <div>
          <h1 className="text-xl font-semibold text-on-surface">JSON Explorer</h1>
          <p className="mt-1 max-w-2xl text-sm text-outline">
            Paste, format, and inspect JSON as an editable document alongside a parsed tree viewer.
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <SplitPane
          persistKey={PANE_RATIO_KEY}
          defaultRatio={0.4}
          className={[
            'h-full w-full overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-inner transition-colors',
            isDragOver ? 'border-primary/50 bg-surface-container-high' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          left={
            <section
              role="region"
              aria-label="JSON editor"
              className="relative flex h-full w-full flex-col overflow-hidden"
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
                  <div className="pointer-events-none absolute inset-0 flex items-start pl-14 pr-6 pt-5 sm:pl-16 sm:pr-10">
                    <p className="font-mono text-xs text-outline">{PLACEHOLDER}</p>
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
              aria-label="JSON viewer"
              className="flex h-full w-full flex-col overflow-hidden bg-surface-container-lowest"
            >
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-outline-variant/20 bg-surface-container-low/80 px-3 py-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter nodes..."
                  debounceMs={0}
                  className="min-w-0 flex-1 [&_input]:!h-7 [&_input]:!py-0 [&_input]:!text-xs [&_svg]:!h-3.5 [&_svg]:!w-3.5"
                />
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    onClick={() => setCollapseAllSignal(signal => signal + 1)}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 py-0 normal-case tracking-normal"
                    title="Collapse all nodes"
                  >
                    <ChevronsDownUp aria-hidden="true" className="h-3 w-3" />
                    Collapse all
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setExpandAllSignal(signal => signal + 1)}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 py-0 normal-case tracking-normal"
                    title="Expand all nodes"
                  >
                    <ChevronsUpDown aria-hidden="true" className="h-3 w-3" />
                    Expand all
                  </Button>
                </div>
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
                    expandAllSignal={expandAllSignal}
                    collapseAllSignal={collapseAllSignal}
                    placeholder={
                      parseResult.ok && tree !== null && filteredTree === null
                        ? 'No matches found'
                        : 'Parsed keys and values will appear here once the document is valid.'
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
    <div className="h-full min-h-0 w-full">
      <JsonExplorerView value={text} onChange={setText} />
    </div>
  );
}
