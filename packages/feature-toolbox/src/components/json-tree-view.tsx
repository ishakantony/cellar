import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronRight, Clipboard, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { JsonNode, JsonNodeKind } from '../lib/json-tree';
import { buildJsonPath } from '../lib/json-path';
import { formatValueForCopy } from '../lib/json-copy';
import { JsonTreeContextMenu } from './json-tree-context-menu';

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

function getRowLabel(node: JsonNode, isRoot: boolean, countBadge: string | null): string {
  const parts = [isRoot ? 'root' : String(node.key), KIND_BADGE[node.kind]];
  if (countBadge !== null) parts.push(countBadge);
  const primitive = formatPrimitive(node);
  if (primitive !== '') parts.push(primitive);
  return parts.join(' ');
}

function isExpandable(node: JsonNode): boolean {
  return (node.kind === 'object' || node.kind === 'array') && (node.count ?? 0) > 0;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return false;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

interface ContextMenuState {
  x: number;
  y: number;
  node: JsonNode;
}

export interface JsonTreeViewProps {
  root: JsonNode | null;
  placeholder?: ReactNode;
  expandAllSignal?: number;
  collapseAllSignal?: number;
}

function collectExpandableIds(node: JsonNode | null): string[] {
  if (node === null) return [];
  const ids: string[] = [];
  if (isExpandable(node)) ids.push(node.id);
  for (const child of node.children ?? []) ids.push(...collectExpandableIds(child));
  return ids;
}

export function JsonTreeView({
  root,
  placeholder = 'Paste JSON to begin...',
  expandAllSignal = 0,
  collapseAllSignal = 0,
}: JsonTreeViewProps) {
  // New JSON opens expanded so paste-and-inspect starts with the full structure visible.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(collectExpandableIds(root)));
  const [stringExpanded, setStringExpanded] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Root is implicitly expanded unless the user has explicitly collapsed it.
  // We track collapse-overrides for the root in the same `expanded` set by
  // adding a sentinel; simpler: just compute an effective set at render time.
  const effectiveExpanded =
    root && isExpandable(root) && !expanded.has(`__collapsed:${root.id}`)
      ? new Set([root.id, ...expanded])
      : expanded;

  const isRootId = (id: string) => root !== null && id === root.id;

  useEffect(() => {
    setExpanded(new Set(collectExpandableIds(root)));
  }, [root]);

  useEffect(() => {
    if (expandAllSignal === 0) return;
    setExpanded(new Set(collectExpandableIds(root)));
  }, [expandAllSignal, root]);

  useEffect(() => {
    if (collapseAllSignal === 0 || root === null) return;
    setExpanded(new Set([`__collapsed:${root.id}`]));
  }, [collapseAllSignal, root]);

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

  const handleCopyPath = useCallback(async (node: JsonNode) => {
    const path = buildJsonPath(node.segments);
    const ok = await copyToClipboard(path);
    if (ok) toast.success('Path copied');
    else toast.error('Could not copy to clipboard');
  }, []);

  const handleCopyValue = useCallback(async (node: JsonNode) => {
    const text = formatValueForCopy(node);
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Value copied');
    else toast.error('Could not copy to clipboard');
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent, node: JsonNode) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  if (root === null) {
    return (
      <div className="px-4 py-8 text-center">
        {typeof placeholder === 'string' ? (
          <p className="text-xs text-outline">{placeholder}</p>
        ) : (
          placeholder
        )}
      </div>
    );
  }

  return (
    <>
      <ul role="tree" className="font-mono text-xs leading-relaxed py-2">
        <JsonRow
          node={root}
          depth={0}
          isRoot
          expanded={effectiveExpanded}
          stringExpanded={stringExpanded}
          onToggle={toggleNode}
          onToggleString={toggleString}
          onCopyPath={handleCopyPath}
          onCopyValue={handleCopyValue}
          onContextMenu={handleContextMenu}
        />
      </ul>
      {contextMenu && (
        <JsonTreeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onCopyPath={() => handleCopyPath(contextMenu.node)}
          onCopyValue={() => handleCopyValue(contextMenu.node)}
          onClose={closeContextMenu}
        />
      )}
    </>
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
  onCopyPath: (node: JsonNode) => void;
  onCopyValue: (node: JsonNode) => void;
  onContextMenu: (event: React.MouseEvent, node: JsonNode) => void;
}

function JsonRow({
  node,
  depth,
  isRoot = false,
  expanded,
  stringExpanded,
  onToggle,
  onToggleString,
  onCopyPath,
  onCopyValue,
  onContextMenu,
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
  const rowLabel = getRowLabel(node, isRoot, countBadge);

  return (
    <li role="treeitem" aria-label={rowLabel} aria-expanded={expandable ? isOpen : undefined}>
      <div
        className="group mx-1 flex items-start gap-2 rounded-lg px-3 py-0.5 transition-colors hover:bg-white/[0.04] focus-within:bg-white/[0.05]"
        style={{ paddingLeft: `${12 + indentPx}px` }}
        onContextMenu={event => onContextMenu(event, node)}
      >
        {expandable ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={`Toggle ${node.id}`}
            aria-expanded={isOpen}
            className="mt-0.5 inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded text-outline transition-colors hover:bg-surface-container-high/70 hover:text-on-surface"
          >
            <ChevronRight
              aria-hidden="true"
              className="h-3 w-3 transition-transform"
              style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </button>
        ) : (
          <span className="mt-0.5 inline-block h-4 w-4 shrink-0" aria-hidden="true" />
        )}

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {!isRoot && (
            <span className="text-primary/90">
              {typeof node.key === 'number' ? node.key : node.key}
            </span>
          )}
          <span className="rounded-full border border-outline-variant/25 bg-surface-container-high/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-outline shadow-sm shadow-black/10">
            {KIND_BADGE[node.kind]}
          </span>
          {countBadge !== null && (
            <span className="text-[10px] font-mono text-outline">{countBadge}</span>
          )}
          {valueEl}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-md bg-surface-container-low/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            aria-label="Copy path"
            onClick={() => onCopyPath(node)}
            className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:bg-surface-container-high focus-visible:text-on-surface"
          >
            <Copy aria-hidden="true" className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="Copy value"
            onClick={() => onCopyValue(node)}
            className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-outline transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:bg-surface-container-high focus-visible:text-on-surface"
          >
            <Clipboard aria-hidden="true" className="h-3 w-3" />
          </button>
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
              onCopyPath={onCopyPath}
              onCopyValue={onCopyValue}
              onContextMenu={onContextMenu}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
