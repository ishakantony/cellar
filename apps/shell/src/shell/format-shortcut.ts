/**
 * Tiny platform-aware shortcut formatter. Uses `⌘` on macOS and `Ctrl` on
 * Windows/Linux. Falls back to `Ctrl` when the platform cannot be detected
 * (e.g. SSR / test environments where `navigator` is unavailable).
 */
export function formatShortcut(key: string): string {
  const upper = key.toUpperCase();
  const platform =
    typeof navigator !== 'undefined'
      ? (navigator.platform || navigator.userAgent || '').toLowerCase()
      : '';
  const isMac = platform.includes('mac');
  return isMac ? `⌘${upper}` : `Ctrl+${upper}`;
}
