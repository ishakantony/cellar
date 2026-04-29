/**
 * JSON parser wrapper for the JSON Explorer.
 *
 * Returns a discriminated union:
 *   { ok: true; value: JsonValue | undefined }   — valid JSON (undefined = empty input)
 *   { ok: false; line: number; col: number; message: string } — parse error
 *
 * Empty / whitespace-only strings are treated as "empty" (ok:true, value:undefined)
 * rather than an error so that the editor placeholder is shown instead of an
 * error card.
 */

import type { JsonValue } from './json-tree';

export type ParseOk = { ok: true; value: JsonValue | undefined };
export type ParseError = { ok: false; line: number; col: number; message: string };
export type ParseResult = ParseOk | ParseError;

/**
 * Attempt to extract line and column from a JSON SyntaxError message.
 *
 * V8 (Chrome / Node):   "Unexpected token 'x', ..." — no position
 *                        "JSON.parse: bad ... at line N col M ..." (older FF)
 *                        "at position N" (modern V8 ≥ Node 20)
 *
 * Firefox:              "JSON.parse: ... at line N column M of the JSON data"
 *
 * Safari:               "JSON Parse error: ..." — no position embedded in message
 *
 * We try several patterns and fall back to scanning the source if we only get
 * an absolute position.
 */
function extractPosition(message: string, source: string): { line: number; col: number } {
  // Firefox / older engines: "line N column M"
  const lineColMatch = /line\s+(\d+)\s+col(?:umn)?\s+(\d+)/i.exec(message);
  if (lineColMatch) {
    return { line: parseInt(lineColMatch[1], 10), col: parseInt(lineColMatch[2], 10) };
  }

  // Modern V8 (Node ≥ 20 / Chrome): "at position N"
  const posMatch = /at position\s+(\d+)/i.exec(message);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    return positionToLineCol(source, pos);
  }

  // Fallback — we have no position info; report line 1, col 1
  return { line: 1, col: 1 };
}

function positionToLineCol(source: string, pos: number): { line: number; col: number } {
  // Clamp to valid range
  const clampedPos = Math.min(pos, source.length);
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < clampedPos; i++) {
    if (source[i] === '\n') {
      line++;
      lastNewline = i;
    }
  }
  const col = clampedPos - lastNewline;
  return { line, col };
}

export function parseJson(text: string): ParseResult {
  // Treat empty / whitespace-only as "no content" — not an error
  if (text.trim() === '') {
    return { ok: true, value: undefined };
  }

  try {
    const value = JSON.parse(text) as JsonValue;
    return { ok: true, value };
  } catch (err) {
    const message = err instanceof SyntaxError ? err.message : String(err);
    const { line, col } = extractPosition(message, text);
    return { ok: false, line, col, message };
  }
}
