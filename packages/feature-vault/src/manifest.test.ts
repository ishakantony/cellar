import { describe, it, expect } from 'vitest';
import manifest from './manifest';
import featureModule from './index';

const NEW_X_LABELS = [
  'New Snippet',
  'New Prompt',
  'New Link',
  'New Note',
  'New Image',
  'New File',
  'New Collection',
];

const NAV_LABELS = ['Go to Vault', 'Go to Assets', 'Go to Collections'];

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
    for (const section of featureModule.nav) {
      for (const item of section.items) {
        expect(item.href.startsWith(manifest.basePath)).toBe(true);
      }
    }
  });

  it('does not include "Toggle sidebar" in vault staticCommands (it belongs to the shell)', () => {
    const toggleCmd = (manifest.staticCommands ?? []).find(c => c.label === 'Toggle sidebar');
    expect(toggleCmd).toBeUndefined();
  });

  it.each(NEW_X_LABELS)('"%s" command has scope: "feature"', label => {
    const cmd = (manifest.staticCommands ?? []).find(c => c.label === label);
    expect(cmd).toBeDefined();
    expect(cmd!.scope).toBe('feature');
  });

  it.each(NEW_X_LABELS)('"%s" command has featureId: "vault"', label => {
    const cmd = (manifest.staticCommands ?? []).find(c => c.label === label);
    expect(cmd).toBeDefined();
    expect(cmd!.featureId).toBe('vault');
  });

  it.each(NAV_LABELS)('navigation command "%s" does not have scope: "feature"', label => {
    const cmd = (manifest.staticCommands ?? []).find(c => c.label === label);
    expect(cmd).toBeDefined();
    expect(cmd!.scope).not.toBe('feature');
  });
});
