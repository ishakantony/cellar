import { useEffect } from 'react';
import { isShortcutSuppressed } from './shortcut-suppression';
import { useSidebarCollapse } from './stores/sidebar-collapse';

/**
 * Wires the global `⌘B` / `Ctrl+B` shortcut that toggles the per-feature
 * sidebar via the persisted collapse store. Suppressed when focus is in
 * an `input`, `textarea`, contenteditable, or CodeMirror surface.
 */
export function useSidebarToggleShortcut(): void {
  useEffect(() => {
    function handler(e: KeyboardEvent): void {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() !== 'b') return;
      if (isShortcutSuppressed(document.activeElement)) return;
      e.preventDefault();
      useSidebarCollapse.getState().toggle();
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
