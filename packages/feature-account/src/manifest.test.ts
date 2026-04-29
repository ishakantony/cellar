import { describe, it, expect } from 'vitest';
import manifest from './manifest';
import featureModule from './index';

describe('feature-account manifest', () => {
  it('declares the account id and basePath', () => {
    expect(manifest.id).toBe('account');
    expect(manifest.basePath).toBe('/account');
  });

  it('does not appear in the rail', () => {
    expect(manifest.rail).toBe(false);
  });

  it('exposes the settings route under basePath', () => {
    expect(featureModule.routes.length).toBeGreaterThan(0);
    const settings = featureModule.routes.find(r => 'path' in r && r.path === 'settings');
    expect(settings).toBeDefined();
  });

  it('exposes an empty nav array (no rail/sidebar entries)', () => {
    expect(featureModule.nav).toEqual([]);
  });
});
