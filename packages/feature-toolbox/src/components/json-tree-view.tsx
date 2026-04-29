import { useState, useCallback, type ReactNode } from 'react';
import type { JsonNode, JsonNodeKind } from '../lib/json-tree';

const TRUNCATE_LIMIT = 80;

const KIND_BADGE: Record<JsonNodeKind, string> = {
  string: '# str',
  number: '# num',
  boolean: '# bool',
  null: '# null',
  array: '[]',
  object: '{}',
};

function formatPrimitive(node: JsonNode): string {
  switch (node.kind) {
    case 'string':
      return `"${node.value as string}"`;
    case 'number':
      return String(node.value);
    case 'boolean':
      return String(node.value);
    case 'null':
      return 'null';
    default:
      return '';
  }
}

function isExpandable(node: JsonNode): boolean {
  return (node.kind === 'object' || node.kind === 'array') && (node.count ?? 0) > 0;
}

export interface JsonTreeViewProps {
  root: JsonNode | null;
  placeholder?: ReactNode;
}

export function JsonTreeView({ root, placeholder = 'Paste JSON to begin...' }: JsonTreeViewProps) {
  // The user's manual expand/collapse state. The root node is always rendered
  // expanded by default; deeper nodes are collapsed unless the user opens them.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set<string>());
  const [stringExpanded, setStringExpanded] = useState<Set<string>>(new Set());

  // Root is implicitly expanded unless the user has explicitly collapsed it.
  // We track collapse-overrides for the root in the same `expanded` set by
  // adding a sentinel; simpler: just compute an effective set at render time.
  const effectiveExpanded =
    root && isExpandable(root) && !expanded.has(`__collapsed:${root.id}`)
      ? new Set([root.id, ...expanded])
      : expanded;

  const isRootId = (id: string) => root !== null && id === root.id;

  const toggleNode = useCallback(
    (id: string) => {
      setExpanded(prev => {
        const next = new Set(prev);
        if (isRootId(id)) {
          // Root is expanded-by-default. We track a sentinel to remember that
          // the user explicitly collapsed the root.
          const collapsedKey = `__collapsed:${id}`;
          if (next.has(collapsedKey)) next.delete(collapsedKey);
          else next.add(collapsedKey);
          return next;
        }
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [root?.id]
  );

  const toggleString = useCallback((id: string) => {
    setStringExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (root === null) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-xs text-outline">{placeholder}</p>
      </div>
    );
  }

  return (
    <ul role="tree" className="font-mono text-xs leading-relaxed py-2">
      <JsonRow
        node={root}
        depth={0}
        isRoot
        expanded={effectiveExpanded}
        stringExpanded={stringExpanded}
        onToggle={toggleNode}
        onToggleString={toggleString}
      />
    </ul>
  );
}

interface JsonRowProps {
  node: JsonNode;
  depth: number;
  isRoot?: boolean;
  expanded: Set<string>;
  stringExpanded: Set<string>;
  onToggle: (id: string) => void;
  onToggleString: (id: string) => void;
}

function JsonRow({
  node,
  depth,
  isRoot = false,
  expanded,
  stringExpanded,
  onToggle,
  onToggleString,
}: JsonRowProps) {
  const expandable = isExpandable(node);
  const isOpen = expanded.has(node.id);
  const indentPx = depth * 16;

  let valueEl: ReactNode = null;
  if (node.kind === 'string') {
    const raw = node.value as string;
    const isStringExpanded = stringExpanded.has(node.id);
    const tooLong = raw.length > TRUNCATE_LIMIT;
    if (tooLong && !isStringExpanded) {
      const display = `"${raw.slice(0, TRUNCATE_LIMIT)}..."`;
      valueEl = (
        <button
          type="button"
          onClick={() => onToggleString(node.id)}
          className="text-left text-on-surface hover:text-primary cursor-pointer break-all"
          title="Click to expand"
        >
          {display}
        </button>
      );
    } else if (tooLong) {
      valueEl = (
        <button
          type="button"
          onClick={() => onToggleString(node.id)}
          className="text-left text-on-surface hover:text-primary cursor-pointer break-all whitespace-pre-wrap"
        >
          {`"${raw}"`}
        </button>
      );
    } else {
      valueEl = <span className="text-on-surface break-all">{`"${raw}"`}</span>;
    }
  } else if (node.kind === 'number' || node.kind === 'boolean' || node.kind === 'null') {
    valueEl = <span className="text-on-surface">{formatPrimitive(node)}</span>;
  }

  const countBadge =
    node.kind === 'array' ? `[${node.count}]` : node.kind === 'object' ? `{${node.count}}` : null;

  return (
    <li role="treeitem" aria-expanded={expandable ? isOpen : undefined}>
      <div
        className="flex items-start gap-2 px-3 py-0.5 hover:bg-surface-container/40"
        style={{ paddingLeft: `${12 + indentPx}px` }}
      >
        {expandable ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={`Toggle ${node.id}`}
            aria-expanded={isOpen}
            className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center text-outline hover:text-on-surface cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-transform"
              style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              {'>'}
            </span>
          </button>
        ) : (
          <span className="mt-0.5 inline-block h-4 w-4 shrink-0" aria-hidden="true" />
        )}

        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {!isRoot && (
            <span className="text-primary">
              {typeof node.key === 'number' ? node.key : node.key}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline bg-surface-container px-1.5 py-0.5 rounded">
            {KIND_BADGE[node.kind]}
          </span>
          {countBadge !== null && (
            <span className="text-[10px] font-mono text-outline">{countBadge}</span>
          )}
          {valueEl}
        </div>
      </div>

      {expandable && isOpen && node.children && (
        <ul role="group">
          {node.children.map(child => (
            <JsonRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              stringExpanded={stringExpanded}
              onToggle={onToggle}
              onToggleString={onToggleString}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
