import { describe, it, expect } from 'vitest';
import { Folder, LayoutDashboard, Package } from 'lucide-react';
import {
  commandPaletteResults,
  type NavEntry,
  type PaletteAsset,
  type PaletteCollection,
} from './command-palette-results';

// Mirrors the runtime `allNavEntries` shape. Per-asset-type entries were
// removed in #007 in favour of in-page filter tabs on the assets page, so
// the Go-To group only carries top-level routes. The real entries come from
// each feature module's `nav` array.
const allNavEntries: NavEntry[] = [
  { href: '/vault', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vault/assets', icon: Package, label: 'All Items' },
  { href: '/vault/collections', icon: Folder, label: 'All Collections' },
];

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

  it('dedup invariant: removes from Recent any asset that also appears in searchAssets (theoretical future case)', () => {
    // In v1 the empty-query branch is only reached when searchAssets is empty,
    // but the module must enforce the invariant regardless so future changes that
    // introduce recents into a branch that also has assets cannot cause duplicates.
    const sharedAsset = makeAsset({ id: 'shared-1', title: 'Shared Asset' });
    const uniqueRecent = makeAsset({ id: 'unique-r', title: 'Unique Recent' });
    const result = commandPaletteResults({
      query: '',
      recentAssets: [sharedAsset, uniqueRecent],
      // Simulate the theoretical coexistence: searchAssets contains sharedAsset
      searchAssets: [sharedAsset],
      searchAssetTotal: 1,
      collections: [],
      navEntries: allNavEntries,
    });

    const recentGroup = result.groups.find(g => g.id === 'recent')!;
    const recentIds = recentGroup.items.map(i => i.asset?.id);
    // shared-1 is in searchAssets so must not appear in Recent
    expect(recentIds).not.toContain('shared-1');
    // unique-r is not in searchAssets so must remain in Recent
    expect(recentIds).toContain('unique-r');
  });

  it('dedup invariant: when all recents are in searchAssets, Recent group is omitted entirely', () => {
    const sharedAsset = makeAsset({ id: 'shared-1', title: 'Shared Asset' });
    const result = commandPaletteResults({
      query: '',
      recentAssets: [sharedAsset],
      searchAssets: [sharedAsset],
      searchAssetTotal: 1,
      collections: [],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('recent');
    // Actions should still be present
    expect(groupIds).toContain('actions');
  });
});

// --- Non-empty query branch ---

describe('commandPaletteResults — non-empty query', () => {
  it('returns groups in order: assets, collections, actions, goto', () => {
    const result = commandPaletteResults({
      query: 'collection',
      recentAssets: [],
      searchAssets: [makeAsset({ id: 'a1', title: 'My Collection Notes', type: 'NOTE' })],
      searchAssetTotal: 1,
      collections: [makeCollection({ id: 'c1', name: 'My Collection' })],
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

  it('fuzzy-matches "items" against Go To nav entries (All Items)', () => {
    const result = commandPaletteResults({
      query: 'items',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const gotoGroup = result.groups.find(g => g.id === 'goto');
    expect(gotoGroup).toBeDefined();
    const labels = gotoGroup!.items.map(i => i.label);
    expect(labels.some(l => l.includes('All Items'))).toBe(true);
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

// --- Issue 004: Actions group filtering and capping ---

describe('commandPaletteResults — Actions group', () => {
  it('filters Actions by query: "new s" matches New Snippet (and not other types)', () => {
    const result = commandPaletteResults({
      query: 'new s',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const actionsGroup = result.groups.find(g => g.id === 'actions');
    expect(actionsGroup).toBeDefined();
    const labels = actionsGroup!.items.map(i => i.label);
    // "new s" matches "New Snippet" and "New Sidebar" keywords — at minimum Snippet
    expect(labels.some(l => l === 'New Snippet')).toBe(true);
    // Sign out should not match "new s"
    expect(labels).not.toContain('Sign out');
  });

  it('filters Actions by query: "out" matches "Sign out"', () => {
    const result = commandPaletteResults({
      query: 'out',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const actionsGroup = result.groups.find(g => g.id === 'actions');
    expect(actionsGroup).toBeDefined();
    const labels = actionsGroup!.items.map(i => i.label);
    expect(labels).toContain('Sign out');
  });

  it('omits Actions group entirely (including header) when no actions match the query', () => {
    const result = commandPaletteResults({
      query: 'xyzzy-no-action-matches',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: [],
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('actions');
  });

  it('caps Actions group at 5 when querying (using a broad query that matches many actions)', () => {
    // "create" is a keyword on all 7 "new" actions — should still cap at 5
    const result = commandPaletteResults({
      query: 'create',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const actionsGroup = result.groups.find(g => g.id === 'actions');
    expect(actionsGroup).toBeDefined();
    expect(actionsGroup!.items.length).toBeLessThanOrEqual(5);
  });

  it('Actions group items have kind="action" and an actionId', () => {
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
    for (const item of actionsGroup!.items) {
      expect(item.kind).toBe('action');
      expect(item.actionId).toBeTruthy();
    }
  });

  it('Actions group appears after Collections and before Go To in query results', () => {
    const result = commandPaletteResults({
      query: 'new',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [makeCollection({ name: 'New Collection Alpha' })],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    const collectionsIdx = groupIds.indexOf('collections');
    const actionsIdx = groupIds.indexOf('actions');

    if (collectionsIdx !== -1 && actionsIdx !== -1) {
      expect(collectionsIdx).toBeLessThan(actionsIdx);
    }
  });

  it('Actions group is shown on empty query (uncapped, all 9 actions)', () => {
    const result = commandPaletteResults({
      query: '',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [],
      navEntries: allNavEntries,
    });

    const actionsGroup = result.groups.find(g => g.id === 'actions');
    expect(actionsGroup).toBeDefined();
    // On empty query, actions are uncapped — all 9 should appear
    expect(actionsGroup!.items.length).toBe(9);
  });
});

// --- Issue 003: Collections group ---

describe('commandPaletteResults — Collections group', () => {
  it('filters collections by name (case-insensitive substring) when querying', () => {
    const result = commandPaletteResults({
      query: 'DESIGN',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [
        makeCollection({ id: 'c1', name: 'Design Assets' }),
        makeCollection({ id: 'c2', name: 'Recipes' }),
        makeCollection({ id: 'c3', name: 'design-drafts' }),
      ],
      navEntries: allNavEntries,
    });

    const group = result.groups.find(g => g.id === 'collections');
    expect(group).toBeDefined();
    const names = group!.items.map(i => i.label);
    expect(names).toContain('Design Assets');
    expect(names).toContain('design-drafts');
    expect(names).not.toContain('Recipes');
  });

  it('caps Collections group at 5 items when more than 5 match', () => {
    const collections = Array.from({ length: 8 }, (_, i) =>
      makeCollection({ id: `c${i}`, name: `Collection ${i}` })
    );
    const result = commandPaletteResults({
      query: 'collection',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections,
      navEntries: allNavEntries,
    });

    const group = result.groups.find(g => g.id === 'collections');
    expect(group).toBeDefined();
    expect(group!.items).toHaveLength(5);
  });

  it('omits Collections group entirely (header included) when no collections match', () => {
    const result = commandPaletteResults({
      query: 'zzznomatch',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [
        makeCollection({ id: 'c1', name: 'Alpha' }),
        makeCollection({ id: 'c2', name: 'Beta' }),
      ],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('collections');
  });

  it('preserves input order (pinned-first from API) in Collections group', () => {
    // API returns pinned-first; module should not re-sort — just cap
    const collections = [
      makeCollection({ id: 'pinned-1', name: 'Pinned Alpha' }),
      makeCollection({ id: 'pinned-2', name: 'Pinned Beta' }),
      makeCollection({ id: 'normal-1', name: 'Normal One' }),
    ];
    const result = commandPaletteResults({
      query: 'alpha',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections,
      navEntries: allNavEntries,
    });

    const group = result.groups.find(g => g.id === 'collections')!;
    expect(group.items[0].collection?.id).toBe('pinned-1');
  });

  it('Collections group items have kind="collection" with a collection reference', () => {
    const result = commandPaletteResults({
      query: 'my',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [makeCollection({ id: 'c1', name: 'My Collection', color: '#3b82f6' })],
      navEntries: allNavEntries,
    });

    const group = result.groups.find(g => g.id === 'collections');
    expect(group).toBeDefined();
    const item = group!.items[0];
    expect(item.kind).toBe('collection');
    expect(item.collection).toBeDefined();
    expect(item.collection!.id).toBe('c1');
    expect(item.collection!.color).toBe('#3b82f6');
  });

  it('Collections group is omitted on empty query', () => {
    const result = commandPaletteResults({
      query: '',
      recentAssets: [],
      searchAssets: [],
      searchAssetTotal: 0,
      collections: [makeCollection({ id: 'c1', name: 'My Collection' })],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    expect(groupIds).not.toContain('collections');
  });

  it('Collections group appears between Assets and Actions in query results', () => {
    const result = commandPaletteResults({
      query: 'test',
      recentAssets: [],
      searchAssets: [makeAsset({ id: 'a1', title: 'Test Asset' })],
      searchAssetTotal: 1,
      collections: [makeCollection({ id: 'c1', name: 'Test Collection' })],
      navEntries: allNavEntries,
    });

    const groupIds = result.groups.map(g => g.id);
    const assetsIdx = groupIds.indexOf('assets');
    const collectionsIdx = groupIds.indexOf('collections');
    const actionsIdx = groupIds.indexOf('actions');

    if (assetsIdx !== -1 && collectionsIdx !== -1) {
      expect(assetsIdx).toBeLessThan(collectionsIdx);
    }
    if (collectionsIdx !== -1 && actionsIdx !== -1) {
      expect(collectionsIdx).toBeLessThan(actionsIdx);
    }
  });
});
