import { describe, it, expect } from 'vitest';
import manifest from './manifest';
import featureModule from './index';

describe('feature-vault manifest', () => {
  it('declares the vault id and basePath', () => {
    expect(manifest.id).toBe('vault');
    expect(manifest.basePath).toBe('/vault');
  });

  it('appears in the rail by default', () => {
    expect(manifest.rail ?? true).toBe(true);
  });

  it('exposes a non-empty route set', () => {
    expect(featureModule.routes.length).toBeGreaterThan(0);
  });

  it('exposes a nav array with hrefs all rooted under basePath', () => {
    expect(featureModule.nav.length).toBeGreaterThan(0);
    for (const item of featureModule.nav) {
      expect(item.href.startsWith(manifest.basePath)).toBe(true);
    }
  });
});
