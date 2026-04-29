/**
 * Tree-filter for the JSON Explorer search feature.
 *
 * filterJsonTree(node, query) -> JsonNode | null
 *
 * Rules:
 *  - Empty query → return the node unchanged (no filtering).
 *  - Matching is case-insensitive substring search on:
 *      • the node's key (converted to string)
 *      • primitive node's value (converted to string)
 *  - If a container's own key matches, include it with ALL its children.
 *  - If a container's descendants match, include the container with only
 *    the matching sub-tree (non-matching siblings are hidden).
 *  - Returns null when there is no match anywhere in the subtree.
 */

import type { JsonNode } from './json-tree';

function primitiveValueString(node: JsonNode): string | null {
  switch (node.kind) {
    case 'string':
      return String(node.value);
    case 'number':
      return String(node.value);
    case 'boolean':
      return String(node.value);
    case 'null':
      return 'null';
    default:
      return null;
  }
}

function nodeMatches(node: JsonNode, q: string): boolean {
  // Check key
  if (node.key !== undefined && String(node.key).toLowerCase().includes(q)) {
    return true;
  }
  // Check primitive value
  const valueStr = primitiveValueString(node);
  if (valueStr !== null && valueStr.toLowerCase().includes(q)) {
    return true;
  }
  return false;
}

export function filterJsonTree(node: JsonNode, query: string): JsonNode | null {
  // Empty query — return unchanged
  if (query === '') return node;

  const q = query.toLowerCase();
  return filterNode(node, q, false);
}

/**
 * @param node    - The node to filter
 * @param q       - Already lowercased query string
 * @param parentKeyMatched - If true, the parent container key matched so this
 *                           entire subtree should be included.
 */
function filterNode(node: JsonNode, q: string, parentKeyMatched: boolean): JsonNode | null {
  if (parentKeyMatched) {
    // Ancestor matched — include this whole subtree unchanged
    return node;
  }

  const selfMatches = nodeMatches(node, q);

  // Primitive node
  if (node.kind !== 'object' && node.kind !== 'array') {
    return selfMatches ? node : null;
  }

  // Container node
  if (!node.children || node.children.length === 0) {
    // Empty container — include if its own key matches
    return selfMatches ? node : null;
  }

  if (selfMatches) {
    // Container key matched → include all children unchanged
    return node;
  }

  // Container key didn't match — recurse into children
  const filteredChildren: JsonNode[] = [];
  for (const child of node.children) {
    const result = filterNode(child, q, false);
    if (result !== null) {
      filteredChildren.push(result);
    }
  }

  if (filteredChildren.length === 0) {
    return null;
  }

  // Return a shallow copy of the container with only matching children
  return {
    ...node,
    children: filteredChildren,
    count: filteredChildren.length,
  };
}
