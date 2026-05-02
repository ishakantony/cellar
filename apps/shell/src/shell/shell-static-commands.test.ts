import { describe, it, expect } from 'vitest';
import { shellStaticCommands } from './shell-static-commands';

describe('shellStaticCommands', () => {
  it('is currently empty (sidebar toggle was removed in the redesign)', () => {
    expect(shellStaticCommands).toEqual([]);
  });

  it('has no entry with scope: "feature"', () => {
    for (const cmd of shellStaticCommands) {
      expect(cmd.scope).not.toBe('feature');
    }
  });
});
