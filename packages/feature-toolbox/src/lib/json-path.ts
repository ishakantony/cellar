/**
 * JSONPath builder for the JSON Explorer.
 *
 * Pure utility: takes the `segments` accumulated by `buildJsonTree` and
 * returns the JSONPath string for that node.
 *
 * Object keys use dot notation (`$.foo`) when the key is an identifier
 * (matching `/^[A-Za-z_$][A-Za-z0-9_$]*$/`). Otherwise, and for any
 * special-character key, bracket + single-quote notation is used
 * (`$['key with spaces']`). Single quotes and backslashes are escaped
 * inside bracket-quoted keys.
 *
 * Array indices always use bracket notation (`$[0]`).
 */

export type PathSegment = string | number;

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function isIdentifierKey(key: string): boolean {
  return IDENTIFIER_RE.test(key);
}

function quoteKey(key: string): string {
  // Escape backslashes first, then single quotes.
  const escaped = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `['${escaped}']`;
}

export function buildJsonPath(segments: PathSegment[]): string {
  let out = '$';
  for (const segment of segments) {
    if (typeof segment === 'number') {
      out += `[${segment}]`;
      continue;
    }
    if (isIdentifierKey(segment)) {
      out += `.${segment}`;
    } else {
      out += quoteKey(segment);
    }
  }
  return out;
}
