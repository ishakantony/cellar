import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commandPaletteActions, type CommandPaletteCtx } from './command-palette-actions';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockCtx(): CommandPaletteCtx {
  return {
    createAsset: vi.fn(),
    createCollection: vi.fn(),
    signOut: vi.fn(),
    toggleSidebar: vi.fn(),
  };
}

function getAction(id: string) {
  const entry = commandPaletteActions.find(a => a.id === id);
  if (!entry) throw new Error(`Action "${id}" not found in registry`);
  return entry;
}

// ---------------------------------------------------------------------------
// Registry shape
// ---------------------------------------------------------------------------

describe('commandPaletteActions registry', () => {
  it('contains exactly 9 entries', () => {
    expect(commandPaletteActions).toHaveLength(9);
  });

  it('every entry has required fields: id, label, icon, group, keywords, run', () => {
    for (const entry of commandPaletteActions) {
      expect(entry.id).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.icon).toBeDefined();
      expect(entry.group).toBe('actions');
      expect(Array.isArray(entry.keywords)).toBe(true);
      expect(typeof entry.run).toBe('function');
    }
  });

  it('all expected ids are present', () => {
    const ids = commandPaletteActions.map(a => a.id);
    expect(ids).toContain('new-snippet');
    expect(ids).toContain('new-prompt');
    expect(ids).toContain('new-link');
    expect(ids).toContain('new-note');
    expect(ids).toContain('new-image');
    expect(ids).toContain('new-file');
    expect(ids).toContain('new-collection');
    expect(ids).toContain('sign-out');
    expect(ids).toContain('toggle-sidebar');
  });
});

// ---------------------------------------------------------------------------
// run(ctx) — each entry calls the expected ctx method with the right args
// ---------------------------------------------------------------------------

describe('commandPaletteActions — run(ctx) behavior', () => {
  let ctx: CommandPaletteCtx;

  beforeEach(() => {
    ctx = makeMockCtx();
  });

  it('"New Snippet" calls createAsset with type SNIPPET', () => {
    getAction('new-snippet').run(ctx);
    expect(ctx.createAsset).toHaveBeenCalledWith('SNIPPET');
    expect(ctx.createAsset).toHaveBeenCalledTimes(1);
  });

  it('"New Prompt" calls createAsset with type PROMPT', () => {
    getAction('new-prompt').run(ctx);
    expect(ctx.createAsset).toHaveBeenCalledWith('PROMPT');
    expect(ctx.createAsset).toHaveBeenCalledTimes(1);
  });

  it('"New Link" calls createAsset with type LINK', () => {
    getAction('new-link').run(ctx);
    expect(ctx.createAsset).toHaveBeenCalledWith('LINK');
    expect(ctx.createAsset).toHaveBeenCalledTimes(1);
  });

  it('"New Note" calls createAsset with type NOTE', () => {
    getAction('new-note').run(ctx);
    expect(ctx.createAsset).toHaveBeenCalledWith('NOTE');
    expect(ctx.createAsset).toHaveBeenCalledTimes(1);
  });

  it('"New Image" calls createAsset with type IMAGE', () => {
    getAction('new-image').run(ctx);
    expect(ctx.createAsset).toHaveBeenCalledWith('IMAGE');
    expect(ctx.createAsset).toHaveBeenCalledTimes(1);
  });

  it('"New File" calls createAsset with type FILE', () => {
    getAction('new-file').run(ctx);
    expect(ctx.createAsset).toHaveBeenCalledWith('FILE');
    expect(ctx.createAsset).toHaveBeenCalledTimes(1);
  });

  it('"New Collection" calls createCollection (not createAsset)', () => {
    getAction('new-collection').run(ctx);
    expect(ctx.createCollection).toHaveBeenCalledTimes(1);
    expect(ctx.createAsset).not.toHaveBeenCalled();
  });

  it('"Sign out" calls signOut', () => {
    getAction('sign-out').run(ctx);
    expect(ctx.signOut).toHaveBeenCalledTimes(1);
    expect(ctx.createAsset).not.toHaveBeenCalled();
    expect(ctx.createCollection).not.toHaveBeenCalled();
    expect(ctx.toggleSidebar).not.toHaveBeenCalled();
  });

  it('"Toggle sidebar" calls toggleSidebar', () => {
    getAction('toggle-sidebar').run(ctx);
    expect(ctx.toggleSidebar).toHaveBeenCalledTimes(1);
    expect(ctx.createAsset).not.toHaveBeenCalled();
    expect(ctx.createCollection).not.toHaveBeenCalled();
    expect(ctx.signOut).not.toHaveBeenCalled();
  });

  it('each "New <Type>" action only calls createAsset once and nothing else', () => {
    const assetActions = [
      'new-snippet',
      'new-prompt',
      'new-link',
      'new-note',
      'new-image',
      'new-file',
    ];
    for (const id of assetActions) {
      const freshCtx = makeMockCtx();
      getAction(id).run(freshCtx);
      expect(freshCtx.createAsset).toHaveBeenCalledTimes(1);
      expect(freshCtx.createCollection).not.toHaveBeenCalled();
      expect(freshCtx.signOut).not.toHaveBeenCalled();
      expect(freshCtx.toggleSidebar).not.toHaveBeenCalled();
    }
  });
});

// ---------------------------------------------------------------------------
// Keyword coverage — used by commandPaletteResults for filtering
// ---------------------------------------------------------------------------

describe('commandPaletteActions — keywords', () => {
  it('"new-snippet" keywords include "snip"', () => {
    expect(getAction('new-snippet').keywords).toContain('snip');
  });

  it('"sign-out" keywords include "logout" and "out"', () => {
    const kw = getAction('sign-out').keywords;
    expect(kw).toContain('logout');
    expect(kw).toContain('out');
  });

  it('"toggle-sidebar" keywords include "sidebar"', () => {
    expect(getAction('toggle-sidebar').keywords).toContain('sidebar');
  });
});
