import { describe, it, expect } from 'vitest';
import manifest from './manifest';
import featureModule from './index';

describe('feature-account manifest', () => {
  it('declares the account id and basePath', () => {
    expect(manifest.id).toBe('account');
    expect(manifest.basePath).toBe('/account');
  });

  it('appears in the app switcher with the account accent', () => {
    expect(manifest.rail).toBe(true);
    expect(manifest.accent).toBe('var(--color-account-accent)');
  });

  it('exposes the settings route under basePath', () => {
    expect(featureModule.routes.length).toBeGreaterThan(0);
    const settings = featureModule.routes.find(r => 'path' in r && r.path === 'settings');
    expect(settings).toBeDefined();
  });

  it('exposes a nav section with the Settings link', () => {
    expect(featureModule.nav.length).toBeGreaterThan(0);
    const items = featureModule.nav.flatMap(s => s.items);
    expect(items.some(i => i.href === '/account/settings')).toBe(true);
  });
});
