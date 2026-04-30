import { describe, it, expectTypeOf } from 'vitest';
import type { PaletteCommand } from './index';

describe('PaletteCommand', () => {
  it('accepts an optional scope field typed as global | feature', () => {
    // scope should be optional — a command without scope must still type-check
    const withoutScope: PaletteCommand = {
      id: 'test',
      label: 'Test',
      group: 'General',
      kind: 'navigate',
      href: '/test',
    };
    expectTypeOf(withoutScope.scope).toEqualTypeOf<'global' | 'feature' | undefined>();
  });

  it('accepts scope: global', () => {
    const cmd: PaletteCommand = {
      id: 'global-cmd',
      label: 'Global',
      group: 'Nav',
      kind: 'navigate',
      href: '/global',
      scope: 'global',
    };
    expectTypeOf(cmd.scope).toEqualTypeOf<'global' | 'feature' | undefined>();
  });

  it('accepts scope: feature', () => {
    const cmd: PaletteCommand = {
      id: 'feature-cmd',
      label: 'Feature',
      group: 'Nav',
      kind: 'navigate',
      href: '/feature',
      scope: 'feature',
    };
    expectTypeOf(cmd.scope).toEqualTypeOf<'global' | 'feature' | undefined>();
  });
});
