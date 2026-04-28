import { describe, it, expect } from 'vitest';
import {
  commandPaletteResults,
  type PaletteAsset,
  type PaletteCollection,
} from './command-palette-results';
import { allNavEntries } from './nav-config';

// Minimal helpers
function makeAsset(overrides: Partial<PaletteAsset> = {}): PaletteAsset {
  return {
    id: 'asset-1',
    title: 'Test Asset',
    type: 'SNIPPET',
    pinned: false,
    updatedAt: new Date('2024-01-01').toISOString(),
    ...overrides,
  };
}

function makeCollection(overrides: Partial<PaletteCollection> = {}): PaletteCollection {
  return {
    id: 'col-1',
    name: 'Test Collection',
    color: null,
    ...overrides,
  };
}

// --- Empty query branch ---

describe('commandPaletteResults — empty query', () => {
  it('returns Recent group and no Go To / Assets / Collections groups', () => {
    const recents = [makeAsset({ id: 'r1', title: 'Recent Asset' })];
    const result = commandPaletteResults({
      query: '',
      recentAssets: recents,
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).toContain('recent');
    expect(groupIds).not.toContain('assets');
    expect(groupIds).not.toContain('collections');
    expect(groupIds).not.toContain('goto');
  });

  it('includes Actions group on empty query', () => {
    const result = commandPaletteResults({
      query: '',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).toContain('actions');
  });

  it('returns only Actions group (no Recent) when recentAssets is empty', () => {
    const result = commandPaletteResults({
      query: '',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('recent');
    expect(groupIds).toContain('actions');
  });

  it('caps Recent group at 6 items', () => {
    const recents = Array.from({ length: 10 }, (_, i) =>
      makeAsset({ id: `r${i}`, title: `Asset ${i}` })
    );
    const result = commandPaletteResults({
      query: '',
      recentAssets: recents,
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const recentGroup = result.groups.find(g => g.id === 'recent');
    expect(recentGroup?.items.length).toBe(6);
  });

  it('returns pinned assets before non-pinned in Recent', () => {
    const recents = [
      makeAsset({ id: 'r1', title: 'Normal', pinned: false }),
      makeAsset({ id: 'r2', title: 'Pinned', pinned: true }),
    ];
    const result = commandPaletteResults({
      query: '',
      recentAssets: recents,
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const recentGroup = result.groups.find(g => g.id === 'recent')!;
    expect(recentGroup.items[0].asset?.id).toBe('r2');
    expect(recentGroup.items[1].asset?.id).toBe('r1');
  });
});

// --- Non-empty query branch ---

describe('commandPaletteResults — non-empty query', () => {
  it('returns groups in order: assets, collections, actions, goto', () => {
    const result = commandPaletteResults({
      query: 'snip',
      recentAssets: [],
      searchAssets: [makeAsset({ id: 'a1', title: 'My Snippet', type: 'SNIPPET' })],
      searchAssetTotal: 1,
      collections: [makeCollection({ id: 'c1', name: 'Snippets Collection' })],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    const assetsIdx = groupIds.indexOf('assets');
    const collectionsIdx = groupIds.indexOf('collections');
    const actionsIdx = groupIds.indexOf('actions');
    const gotoIdx = groupIds.indexOf('goto');

    expect(assetsIdx).toBeLessThan(collectionsIdx);
    expect(collectionsIdx).toBeLessThan(actionsIdx);
    expect(actionsIdx).toBeLessThan(gotoIdx);
  });

  it('omits empty groups entirely including their headers', () => {
    const result = commandPaletteResults({
      query: 'zzznomatch',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    expect(result.groups).toHaveLength(0);
  });

  it('caps each group at 5 results when querying', () => {
    const manyAssets = Array.from({ length: 10 }, (_, i) =>
      makeAsset({ id: `a${i}`, title: `Asset ${i}` })
    );
    const manyCollections = Array.from({ length: 10 }, (_, i) =>
      makeCollection({ id: `c${i}`, name: `Collection ${i}` })
    );
    const result = commandPaletteResults({
      query: 'test',
      recentAssets: [],
      searchAssets: manyAssets,
      searchAssetTotal: 10,
      collections: manyCollections,
      navEntries: allNavEntries,
    });

    for (const group of result.groups) {
      expect(group.items.length).toBeLessThanOrEqual(5);
    }
  });

  it('does not return Recent group when query is non-empty', () => {
    const result = commandPaletteResults({
      query: 'hello',
      recentAssets: [makeAsset()],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('recent');
  });

  it('reports total asset match count alongside the assets group', () => {
    const result = commandPaletteResults({
      query: 'asset',
      recentAssets: [],
      searchAssets: [makeAsset({ id: 'a1' }), makeAsset({ id: 'a2' })],
      searchAssetTotal: 12,
      collections: [],
      navEntries: allNavEntries,
    });

    const assetsGroup = result.groups.find(g => g.id === 'assets');
    expect(assetsGroup?.totalCount).toBe(12);
  });

  it('fuzzy-matches "snip" against Go To nav entries (Snippets)', () => {
    const result = commandPaletteResults({
      query: 'snip',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const gotoGroup = result.groups.find(g => g.id === 'goto');
    expect(gotoGroup).toBeDefined();
    const labels = gotoGroup!.items.map(i => i.label);
    expect(labels.some(l => l.toLowerCase().includes('snippet'))).toBe(true);
  });

  it('fuzzy-matches "snip" against Actions (New Snippet)', () => {
    const result = commandPaletteResults({
      query: 'snip',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const actionsGroup = result.groups.find(g => g.id === 'actions');
    expect(actionsGroup).toBeDefined();
    const labels = actionsGroup!.items.map(i => i.label);
    expect(labels.some(l => l.toLowerCase().includes('snippet'))).toBe(true);
  });

  it('filters collections by name when querying', () => {
    const result = commandPaletteResults({
      query: 'alpha',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [
        makeCollection({ id: 'c1', name: 'Alpha Collection' }),
        makeCollection({ id: 'c2', name: 'Beta Collection' }),
      ],
      navEntries: allNavEntries,
    });

    const collectionsGroup = result.groups.find(g => g.id === 'collections');
    expect(collectionsGroup).toBeDefined();
    expect(collectionsGroup!.items).toHaveLength(1);
    expect(collectionsGroup!.items[0].label).toBe('Alpha Collection');
  });

  it('does not duplicate recents that appear in asset search results', () => {
    const shared = makeAsset({ id: 'shared-1', title: 'Shared Asset' });
    const result = commandPaletteResults({
      query: 'shared',
      recentAssets: [shared],
      searchAssets: [shared],
      searchAssetTotal: 1,
      collections: [],
      navEntries: allNavEntries,
    });

    // When querying, recent should not show; assets should show
    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('recent');
    const assetsGroup = result.groups.find(g => g.id === 'assets');
    const allItems = assetsGroup?.items ?? [];
    const ids = allItems.map(i => i.asset?.id);
    expect(ids.filter(id => id === 'shared-1')).toHaveLength(1);
  });

  // --- Issue 002: Assets group specific tests ---

  it('Assets group is capped at 5 items even when more results are provided', () => {
    const manyAssets = Array.from({ length: 8 }, (_, i) =>
      makeAsset({ id: `a${i}`, title: `Asset ${i}` })
    );
    const result = commandPaletteResults({
      query: 'asset',
      recentAssets: [],
      searchAssets: manyAssets,
      searchAssetTotal: 8,
      collections: [],
      navEntries: allNavEntries,
    });

    const assetsGroup = result.groups.find(g => g.id === 'assets');
    expect(assetsGroup).toBeDefined();
    expect(assetsGroup!.items).toHaveLength(5);
  });

  it('Assets group is omitted entirely (header included) when searchAssets is empty', () => {
    const result = commandPaletteResults({
      query: 'nomatch',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('assets');
  });

  it('preserves pinned-first ordering from server in Assets group', () => {
    // Server returns pinned first — the module should preserve this order
    const assets = [
      makeAsset({ id: 'p1', title: 'Pinned One', pinned: true }),
      makeAsset({ id: 'p2', title: 'Pinned Two', pinned: true }),
      makeAsset({ id: 'n1', title: 'Normal One', pinned: false }),
    ];
    const result = commandPaletteResults({
      query: 'one',
      recentAssets: [],
      searchAssets: assets,
      searchAssetTotal: 3,
      collections: [],
      navEntries: allNavEntries,
    });

    const assetsGroup = result.groups.find(g => g.id === 'assets')!;
    expect(assetsGroup.items[0].asset?.pinned).toBe(true);
    expect(assetsGroup.items[1].asset?.pinned).toBe(true);
    expect(assetsGroup.items[2].asset?.pinned).toBe(false);
  });

  it('totalCount is reported as searchAssetTotal on the Assets group', () => {
    const result = commandPaletteResults({
      query: 'test',
      recentAssets: [],
      searchAssets: Array.from({ length: 5 }, (_, i) => makeAsset({ id: `a${i}` })),
      searchAssetTotal: 23,
      collections: [],
      navEntries: allNavEntries,
    });

    const assetsGroup = result.groups.find(g => g.id === 'assets');
    expect(assetsGroup?.totalCount).toBe(23);
  });
});
