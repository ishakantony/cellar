/**
 * Copy-value formatter for JSON Explorer tree nodes.
 *
 * Primitives are emitted directly:
 *   - strings copy as their raw text (no surrounding quotes)
 *   - numbers / booleans copy via String(value)
 *   - null copies as the literal "null"
 * Containers (object / array) are reconstructed and pretty-printed with
 * `JSON.stringify(value, null, 2)`.
 */

import type { JsonNode, JsonValue } from './json-tree';

function reconstruct(node: JsonNode): JsonValue {
  switch (node.kind) {
    case 'string':
      return node.value as string;
    case 'number':
      return node.value as number;
    case 'boolean':
      return node.value as boolean;
    case 'null':
      return null;
    case 'array': {
      const out: JsonValue[] = [];
      for (const child of node.children ?? []) {
        out.push(reconstruct(child));
      }
      return out;
    }
    case 'object': {
      const out: { [k: string]: JsonValue } = {};
      for (const child of node.children ?? []) {
        out[String(child.key)] = reconstruct(child);
      }
      return out;
    }
  }
}

export function formatValueForCopy(node: JsonNode): string {
  switch (node.kind) {
    case 'string':
      return node.value as string;
    case 'number':
    case 'boolean':
      return String(node.value);
    case 'null':
      return 'null';
    case 'array':
    case 'object':
      return JSON.stringify(reconstruct(node), null, 2);
  }
}
