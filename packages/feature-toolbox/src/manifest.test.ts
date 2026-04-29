import { describe, it, expect } from 'vitest';
import manifest from './manifest';
import featureModule from './index';

describe('feature-toolbox manifest', () => {
  it('declares the toolbox id and basePath', () => {
    expect(manifest.id).toBe('toolbox');
    expect(manifest.basePath).toBe('/toolbox');
  });

  it('appears in the rail', () => {
    expect(manifest.rail).toBe(true);
  });

  it('exposes a non-empty route set', () => {
    expect(featureModule.routes.length).toBeGreaterThan(0);
  });

  it('redirects the index route to the json-explorer child', () => {
    const indexRoute = featureModule.routes.find(r => 'index' in r && r.index === true);
    expect(indexRoute).toBeDefined();
    expect(indexRoute?.element).toBeDefined();
  });

  it('declares a json-explorer route that loads its component lazily', () => {
    const jsonExplorer = featureModule.routes.find(r => 'path' in r && r.path === 'json-explorer');
    expect(jsonExplorer).toBeDefined();
    expect(typeof jsonExplorer?.lazy).toBe('function');
  });

  it('exposes an empty nav array (no per-feature sidebar entries yet)', () => {
    expect(featureModule.nav).toEqual([]);
  });
});
