import { useCallback, useMemo, useState } from 'react';
import { CodeMirrorEditor, SplitPane } from '@cellar/ui';
import { buildJsonTree, type JsonNode, type JsonValue } from '../lib/json-tree';
import { formatJson, minifyJson } from '../lib/json-format';
import { JsonTreeView } from '../components/json-tree-view';
import { RightPaneTabs } from '../components/right-pane-tabs';
import { EditorToolbar } from '../components/editor-toolbar';
import { useJsonDrop } from '../hooks/use-json-drop';

const PLACEHOLDER = 'Paste JSON to begin…';
const PANE_RATIO_KEY = 'cellar:json-explorer:pane-ratio';

/**
 * Controlled view component. The page is a thin shell around this so tests
 * can drive `value`/`onChange` directly without poking CodeMirror.
 */
export interface JsonExplorerViewProps {
  value: string;
  onChange: (next: string) => void;
}

export function JsonExplorerView({ value, onChange }: JsonExplorerViewProps) {
  const tree: JsonNode | null = useMemo(() => {
    if (value.trim() === '') return null;
    try {
      const parsed = JSON.parse(value) as JsonValue;
      return buildJsonTree(parsed);
    } catch {
      // invalid JSON: error UI ships in #013; for now we show the placeholder.
      return null;
    }
  }, [value]);

  const handleFormat = useCallback(() => {
    onChange(formatJson(value));
  }, [value, onChange]);

  const handleMinify = useCallback(() => {
    onChange(minifyJson(value));
  }, [value, onChange]);

  const { isDragOver, dragHandlers } = useJsonDrop({ onChange });

  return (
    <SplitPane
      persistKey={PANE_RATIO_KEY}
      defaultRatio={0.4}
      className="h-full w-full"
      left={
        <div className="relative flex h-full w-full flex-col bg-surface-container-lowest">
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
            <CodeMirrorEditor value={value} onChange={onChange} language="json" />
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
        </div>
      }
      right={
        <div className="flex h-full w-full flex-col bg-surface-container-lowest">
          <RightPaneTabs activeId="tree" />
          <div className="flex-1 min-h-0 overflow-auto">
            <JsonTreeView root={tree} placeholder={PLACEHOLDER} />
          </div>
        </div>
      }
    />
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
    <div className="h-full w-full">
      <JsonExplorerView value={text} onChange={setText} />
    </div>
  );
}
