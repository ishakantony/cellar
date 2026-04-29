/**
 * Pure formatting utilities for the JSON Explorer editor toolbar.
 *
 * Both functions are silent no-ops on invalid JSON — they return the
 * original string unchanged so the editor state is preserved.
 */

/**
 * Pretty-prints the JSON string using 2-space indentation.
 * Returns the original string if parsing fails or the string is empty.
 */
export function formatJson(raw: string): string {
  if (raw.trim() === '') return raw;
  try {
    const parsed: unknown = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

/**
 * Minifies the JSON string by stripping all unnecessary whitespace.
 * Returns the original string if parsing fails or the string is empty.
 */
export function minifyJson(raw: string): string {
  if (raw.trim() === '') return raw;
  try {
    const parsed: unknown = JSON.parse(raw);
    return JSON.stringify(parsed);
  } catch {
    return raw;
  }
}
