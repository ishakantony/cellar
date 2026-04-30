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

  it('declares a base64 route that loads its component lazily', () => {
    const base64 = featureModule.routes.find(r => 'path' in r && r.path === 'base64');
    expect(base64).toBeDefined();
    expect(typeof base64?.lazy).toBe('function');
  });

  it('exposes the JSON Explorer nav item', () => {
    expect(featureModule.nav).toHaveLength(1);
    const items = featureModule.nav[0]?.items;
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'json-explorer',
          label: 'JSON Explorer',
          href: '/toolbox/json-explorer',
        }),
      ])
    );
  });

  it('exposes the Base64 nav item', () => {
    const items = featureModule.nav[0]?.items;
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'base64',
          label: 'Base64',
          href: '/toolbox/base64',
        }),
      ])
    );
  });
    
  it('exposes an Explorers section with JSON Explorer', () => {
    const explorers = featureModule.nav.find(s => s.title === 'Explorers');
    expect(explorers).toBeDefined();
    expect(explorers?.items).toEqual([
      expect.objectContaining({
        id: 'json-explorer',
        label: 'JSON Explorer',
        href: '/toolbox/json-explorer',
      }),
    ]);
  });

  it('exposes an Encoders section with URL Encoder', () => {
    const encoders = featureModule.nav.find(s => s.title === 'Encoders');
    expect(encoders).toBeDefined();
    expect(encoders?.items).toEqual([
      expect.objectContaining({
        id: 'url-encoder',
        label: 'URL Encoder',
        href: '/toolbox/url-encoder',
      }),
    ]);
  });

  it('declares a url-encoder route that loads its component lazily', () => {
    const urlEncoder = featureModule.routes.find(r => 'path' in r && r.path === 'url-encoder');
    expect(urlEncoder).toBeDefined();
    expect(typeof urlEncoder?.lazy).toBe('function');
  });

  it('includes an Open URL Encoder command in the manifest', () => {
    const cmd = manifest.staticCommands?.find(c => c.id === 'toolbox-open-url-encoder');
    expect(cmd).toBeDefined();
    expect(cmd?.label).toBe('Open URL Encoder');
    expect(cmd?.kind).toBe('navigate');
    expect(cmd?.href).toBe('/toolbox/url-encoder');
  });
});
