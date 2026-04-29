/**
 * JSON tree primitives for the JSON Explorer.
 *
 * Pure data transform: takes a parsed JSON value and returns a normalized
 * tree of `JsonNode` records suitable for the renderer in
 * `components/json-tree-view.tsx`.
 *
 * Note: node `id` is intentionally simple (e.g. `root`, `root.users`,
 * `root.users[0]`). It is NOT a formal JSONPath. Issue #011 introduces a
 * dedicated path-builder utility for copy-path interactions; do not pre-empt
 * that here.
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

export type JsonNodeKind = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';

export interface JsonNode {
  /** Stable id for React keys + selection. Path-based: e.g., `root.users[0].name`. */
  id: string;
  /** Stack of segments accumulated from the root. Useful for the tree renderer. */
  segments: Array<string | number>;
  /** key relative to parent. For root, undefined; for an object child the property
   * name; for an array child the index. */
  key: string | number | undefined;
  kind: JsonNodeKind;
  /** Primitive value if kind is primitive; otherwise undefined. */
  value?: string | number | boolean | null;
  /** Number of children for objects/arrays. */
  count?: number;
  children?: JsonNode[];
}

function kindOf(value: JsonValue): JsonNodeKind {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'object';
  }
}

function buildNode(
  value: JsonValue,
  id: string,
  segments: Array<string | number>,
  key: string | number | undefined
): JsonNode {
  const kind = kindOf(value);

  if (kind === 'object') {
    const obj = value as { [k: string]: JsonValue };
    const entries = Object.keys(obj);
    const children: JsonNode[] = entries.map(childKey => {
      const childId = `${id}.${childKey}`;
      return buildNode(obj[childKey], childId, [...segments, childKey], childKey);
    });
    return { id, segments, key, kind, count: entries.length, children };
  }

  if (kind === 'array') {
    const arr = value as JsonValue[];
    const children: JsonNode[] = arr.map((item, index) => {
      const childId = `${id}[${index}]`;
      return buildNode(item, childId, [...segments, index], index);
    });
    return { id, segments, key, kind, count: arr.length, children };
  }

  return {
    id,
    segments,
    key,
    kind,
    value: value as string | number | boolean | null,
  };
}

export function buildJsonTree(root: JsonValue): JsonNode {
  return buildNode(root, 'root', [], undefined);
}
