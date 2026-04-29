import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isShortcutSuppressed } from './shortcut-suppression';

describe('isShortcutSuppressed', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('returns false for a null target', () => {
    expect(isShortcutSuppressed(null)).toBe(false);
  });

  it('returns false for a plain layout element', () => {
    const div = document.createElement('div');
    host.appendChild(div);
    expect(isShortcutSuppressed(div)).toBe(false);
  });

  it('returns true for an <input>', () => {
    const input = document.createElement('input');
    host.appendChild(input);
    expect(isShortcutSuppressed(input)).toBe(true);
  });

  it('returns true for a <textarea>', () => {
    const textarea = document.createElement('textarea');
    host.appendChild(textarea);
    expect(isShortcutSuppressed(textarea)).toBe(true);
  });

  it('returns true for a contenteditable element', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    host.appendChild(editable);
    expect(isShortcutSuppressed(editable)).toBe(true);
  });

  it('returns true for any descendant of a CodeMirror editor', () => {
    const cm = document.createElement('div');
    cm.className = 'cm-editor';
    const inner = document.createElement('div');
    cm.appendChild(inner);
    host.appendChild(cm);
    expect(isShortcutSuppressed(inner)).toBe(true);
    expect(isShortcutSuppressed(cm)).toBe(true);
  });

  it('returns false when target is not an Element (e.g. window)', () => {
    expect(isShortcutSuppressed(window)).toBe(false);
  });
});
