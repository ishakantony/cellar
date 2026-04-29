/**
 * Pure predicate the shell uses to decide whether a global keyboard shortcut
 * should fire. Returns `true` when the user is typing into a text surface
 * (input, textarea, contenteditable, CodeMirror), in which case the shortcut
 * must NOT trigger.
 *
 * Used by `⌘B` (collapse sidebar) and other shell-level shortcuts. Lives
 * here so #006 can wire it without re-deriving the rules.
 */
export function isShortcutSuppressed(target: EventTarget | null): boolean {
  if (!target) return false;
  if (!(target instanceof Element)) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;

  if (target instanceof HTMLElement && target.isContentEditable) return true;

  // CodeMirror 6 mounts focusable surfaces inside a `.cm-editor` container.
  // The actual focus target may be a contenteditable child, but checking the
  // ancestor is robust regardless of where focus actually landed.
  if (target.closest('.cm-editor')) return true;

  return false;
}
