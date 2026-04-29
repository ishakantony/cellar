import { useMemo, useState } from 'react';
import { CodeMirrorEditor, SplitPane } from '@cellar/ui';
import { buildJsonTree, type JsonNode, type JsonValue } from '../lib/json-tree';
import { JsonTreeView } from '../components/json-tree-view';
import { RightPaneTabs } from '../components/right-pane-tabs';

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

  return (
    <SplitPane
      persistKey={PANE_RATIO_KEY}
      defaultRatio={0.4}
      className="h-full w-full"
      left={
        <div className="relative h-full w-full bg-surface-container-lowest">
          <CodeMirrorEditor value={value} onChange={onChange} language="json" />
          {value === '' && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-start px-12 pt-4 text-xs text-outline font-mono"
            >
              {PLACEHOLDER}
            </div>
          )}
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
