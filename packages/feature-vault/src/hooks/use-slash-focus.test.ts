import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { shouldIgnoreShortcut } from './use-slash-focus';

describe('shouldIgnoreShortcut', () => {
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('returns false for null', () => {
    expect(shouldIgnoreShortcut(null)).toBe(false);
  });

  it('returns false for a plain div', () => {
    const div = document.createElement('div');
    host.appendChild(div);
    expect(shouldIgnoreShortcut(div)).toBe(false);
  });

  it('returns false for window (not an Element)', () => {
    expect(shouldIgnoreShortcut(window)).toBe(false);
  });

  it('returns true for an <input>', () => {
    const input = document.createElement('input');
    host.appendChild(input);
    expect(shouldIgnoreShortcut(input)).toBe(true);
  });

  it('returns true for a <textarea>', () => {
    const textarea = document.createElement('textarea');
    host.appendChild(textarea);
    expect(shouldIgnoreShortcut(textarea)).toBe(true);
  });

  it('returns true for a contenteditable element', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    host.appendChild(editable);
    expect(shouldIgnoreShortcut(editable)).toBe(true);
  });

  it('returns true for the .cm-editor element itself', () => {
    const cm = document.createElement('div');
    cm.className = 'cm-editor';
    host.appendChild(cm);
    expect(shouldIgnoreShortcut(cm)).toBe(true);
  });

  it('returns true for a descendant of a CodeMirror editor', () => {
    const cm = document.createElement('div');
    cm.className = 'cm-editor';
    const inner = document.createElement('div');
    cm.appendChild(inner);
    host.appendChild(cm);
    expect(shouldIgnoreShortcut(inner)).toBe(true);
  });
});
