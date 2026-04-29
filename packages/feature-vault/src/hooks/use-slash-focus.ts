import { useEffect, type RefObject } from 'react';

/**
 * Returns true when the current focus target is a text-entry surface where a
 * global shortcut must NOT fire: `input`, `textarea`, `contenteditable`, or
 * any descendant of a CodeMirror editor (`.cm-editor`).
 */
export function shouldIgnoreShortcut(target: EventTarget | null): boolean {
  if (!target) return false;
  if (!(target instanceof Element)) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;

  if (target instanceof HTMLElement && target.isContentEditable) return true;

  // CodeMirror 6 mounts its editable surface inside a `.cm-editor` container.
  if (target.closest('.cm-editor')) return true;

  return false;
}

/**
 * Registers a window-level `keydown` listener that focuses `ref.current` when
 * the user presses `/`, unless focus is already in a text-entry surface.
 *
 * The listener is registered on mount and cleaned up on unmount — no
 * cross-page leaks. Pages opt in with a single line:
 *
 * ```ts
 * useSlashFocus(searchInputRef);
 * ```
 */
export function useSlashFocus(ref: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    function handler(event: KeyboardEvent): void {
      if (event.key !== '/') return;
      if (shouldIgnoreShortcut(document.activeElement)) return;
      event.preventDefault();
      ref.current?.focus();
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ref]);
}
