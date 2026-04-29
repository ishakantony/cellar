import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useSidebarToggleShortcut } from './use-sidebar-toggle-shortcut';
import { useSidebarCollapse } from './stores/sidebar-collapse';

function HookHost() {
  useSidebarToggleShortcut();
  return null;
}

function dispatchKey(init: KeyboardEventInit & { key: string }) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
  });
}

describe('useSidebarToggleShortcut', () => {
  beforeEach(() => {
    act(() => {
      useSidebarCollapse.setState({ collapsed: false });
    });
  });

  afterEach(() => {
    act(() => {
      useSidebarCollapse.setState({ collapsed: false });
    });
  });

  it('toggles the sidebar on ⌘B', () => {
    render(<HookHost />);
    expect(useSidebarCollapse.getState().collapsed).toBe(false);
    dispatchKey({ key: 'b', metaKey: true });
    expect(useSidebarCollapse.getState().collapsed).toBe(true);
    dispatchKey({ key: 'b', metaKey: true });
    expect(useSidebarCollapse.getState().collapsed).toBe(false);
  });

  it('toggles the sidebar on Ctrl+B', () => {
    render(<HookHost />);
    expect(useSidebarCollapse.getState().collapsed).toBe(false);
    dispatchKey({ key: 'b', ctrlKey: true });
    expect(useSidebarCollapse.getState().collapsed).toBe(true);
  });

  it('also handles uppercase B (e.g. with Shift)', () => {
    render(<HookHost />);
    dispatchKey({ key: 'B', metaKey: true });
    expect(useSidebarCollapse.getState().collapsed).toBe(true);
  });

  it('ignores B without a modifier', () => {
    render(<HookHost />);
    dispatchKey({ key: 'b' });
    expect(useSidebarCollapse.getState().collapsed).toBe(false);
  });

  it('ignores other keys with the modifier', () => {
    render(<HookHost />);
    dispatchKey({ key: 'k', metaKey: true });
    expect(useSidebarCollapse.getState().collapsed).toBe(false);
  });

  it('is suppressed when focus is inside an <input>', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    render(<HookHost />);
    dispatchKey({ key: 'b', metaKey: true });

    expect(useSidebarCollapse.getState().collapsed).toBe(false);
    input.remove();
  });

  it('is suppressed when focus is inside a <textarea>', () => {
    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    ta.focus();

    render(<HookHost />);
    dispatchKey({ key: 'b', metaKey: true });

    expect(useSidebarCollapse.getState().collapsed).toBe(false);
    ta.remove();
  });

  it('is suppressed when focus is inside a contenteditable element', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    editable.tabIndex = 0;
    document.body.appendChild(editable);
    editable.focus();

    render(<HookHost />);
    dispatchKey({ key: 'b', metaKey: true });

    expect(useSidebarCollapse.getState().collapsed).toBe(false);
    editable.remove();
  });

  it('is suppressed when focus is inside a CodeMirror editor', () => {
    const cm = document.createElement('div');
    cm.className = 'cm-editor';
    const inner = document.createElement('div');
    inner.tabIndex = 0;
    cm.appendChild(inner);
    document.body.appendChild(cm);
    inner.focus();

    render(<HookHost />);
    dispatchKey({ key: 'b', metaKey: true });

    expect(useSidebarCollapse.getState().collapsed).toBe(false);
    cm.remove();
  });

  it('removes the listener on unmount', () => {
    const { unmount } = render(<HookHost />);
    unmount();
    dispatchKey({ key: 'b', metaKey: true });
    expect(useSidebarCollapse.getState().collapsed).toBe(false);
  });
});
