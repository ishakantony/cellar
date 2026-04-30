import { describe, it, expect } from 'vitest';
import { filterCommandsByScope } from './filter-commands-by-scope';
import type { PaletteCommand } from '@cellar/shell-contract';

// ---------------------------------------------------------------------------
// Minimal stub commands used across tests
// ---------------------------------------------------------------------------

const globalNav: PaletteCommand = {
  id: 'vault-goto-vault',
  label: 'Go to Vault',
  group: 'Go To',
  kind: 'navigate',
  href: '/vault',
  // scope omitted → defaults to global
};

const globalAction: PaletteCommand = {
  id: 'shell-toggle-sidebar',
  label: 'Toggle sidebar',
  group: 'Shell',
  kind: 'action',
  scope: 'global',
};

const vaultFeatureAction: PaletteCommand = {
  id: 'vault-new-snippet',
  label: 'New Snippet',
  group: 'Quick Actions',
  kind: 'action',
  scope: 'feature',
  featureId: 'vault',
};

const toolboxFeatureAction: PaletteCommand = {
  id: 'toolbox-new-thing',
  label: 'New Thing',
  group: 'Quick Actions',
  kind: 'action',
  scope: 'feature',
  featureId: 'toolbox',
};

const allCommands = [globalNav, globalAction, vaultFeatureAction, toolboxFeatureAction];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('filterCommandsByScope', () => {
  it('global commands (no scope) are always shown regardless of activeFeatureId', () => {
    const result = filterCommandsByScope(allCommands, 'toolbox');
    expect(result).toContainEqual(globalNav);
  });

  it('commands with scope: "global" are always shown', () => {
    const result = filterCommandsByScope(allCommands, null);
    expect(result).toContainEqual(globalAction);
  });

  it('feature-scoped commands are shown when activeFeatureId matches their featureId', () => {
    const result = filterCommandsByScope(allCommands, 'vault');
    expect(result).toContainEqual(vaultFeatureAction);
  });

  it('feature-scoped commands are hidden when activeFeatureId does not match their featureId', () => {
    const result = filterCommandsByScope(allCommands, 'toolbox');
    expect(result).not.toContainEqual(vaultFeatureAction);
  });

  it('feature-scoped commands for the active feature are shown, others are hidden', () => {
    const result = filterCommandsByScope(allCommands, 'toolbox');
    expect(result).toContainEqual(toolboxFeatureAction);
    expect(result).not.toContainEqual(vaultFeatureAction);
  });

  it('all feature-scoped commands are hidden when activeFeatureId is null', () => {
    const result = filterCommandsByScope(allCommands, null);
    expect(result).not.toContainEqual(vaultFeatureAction);
    expect(result).not.toContainEqual(toolboxFeatureAction);
  });

  it('returns only global commands when activeFeatureId is null', () => {
    const result = filterCommandsByScope(allCommands, null);
    expect(result).toEqual([globalNav, globalAction]);
  });

  it('handles an empty command list', () => {
    expect(filterCommandsByScope([], 'vault')).toEqual([]);
  });

  it('handles commands with scope: "feature" but no featureId (always hidden)', () => {
    const orphan: PaletteCommand = {
      id: 'orphan',
      label: 'Orphan',
      group: 'Test',
      kind: 'action',
      scope: 'feature',
      // no featureId — should never match any feature
    };
    expect(filterCommandsByScope([orphan], 'vault')).toEqual([]);
    expect(filterCommandsByScope([orphan], null)).toEqual([]);
  });
});
