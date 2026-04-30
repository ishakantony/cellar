import { describe, it, expect } from 'vitest';
import { shellStaticCommands } from './shell-static-commands';

describe('shellStaticCommands', () => {
  it('is non-empty', () => {
    expect(shellStaticCommands.length).toBeGreaterThan(0);
  });

  it('contains "Toggle sidebar"', () => {
    const cmd = shellStaticCommands.find(c => c.label === 'Toggle sidebar');
    expect(cmd).toBeDefined();
  });

  it('has no entry with scope: "feature"', () => {
    for (const cmd of shellStaticCommands) {
      expect(cmd.scope).not.toBe('feature');
    }
  });

  it('"Toggle sidebar" dispatches the cellar:toggle-sidebar DOM event', () => {
    const cmd = shellStaticCommands.find(c => c.label === 'Toggle sidebar');
    expect(cmd).toBeDefined();
    expect(cmd!.kind).toBe('action');

    const events: Event[] = [];
    document.addEventListener('cellar:toggle-sidebar', e => events.push(e));
    cmd!.action!();
    expect(events).toHaveLength(1);
  });
});
