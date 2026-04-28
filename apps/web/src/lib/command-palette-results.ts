import type { NavEntry } from './nav-config';
import type { AssetType } from '@cellar/shared';
import { commandPaletteActions } from './command-palette-actions';

// ---------------------------------------------------------------------------
// Types exposed to consumers
// ---------------------------------------------------------------------------

export interface PaletteAsset {
  id: string;
  title: string;
  type: AssetType;
  pinned: boolean;
  updatedAt: string;
}

export interface PaletteCollection {
  id: string;
  name: string;
  color: string | null;
}

export type PaletteItemKind = 'asset' | 'collection' | 'action' | 'nav';

export interface PaletteItem {
  id: string;
  kind: PaletteItemKind;
  label: string;
  /** For asset items */
  asset?: PaletteAsset;
  /** For collection items */
  collection?: PaletteCollection;
  /** For nav items */
  href?: string;
  /** For action items — key into the action registry */
  actionId?: string;
  /** Keywords used for filtering (used by actions and nav) */
  keywords?: string[];
}

export interface PaletteGroup {
  id: 'recent' | 'assets' | 'collections' | 'actions' | 'goto';
  label: string;
  items: PaletteItem[];
  /** Only set on the "assets" group — the server-reported total match count */
  totalCount?: number;
}

export interface PaletteResult {
  groups: PaletteGroup[];
}

// ---------------------------------------------------------------------------
// Static action entries — derived from the commandPaletteActions registry so
// there is a single source of truth. The results module only needs id/label/keywords.
// ---------------------------------------------------------------------------

export interface ActionEntry {
  id: string;
  label: string;
  keywords: string[];
}

/** Derived from commandPaletteActions — keeps filtering in sync with the registry. */
export const ACTION_ENTRIES: ActionEntry[] = commandPaletteActions.map(
  ({ id, label, keywords }) => ({
    id,
    label,
    keywords,
  })
);

// ---------------------------------------------------------------------------
// Fuzzy / substring match helper
// ---------------------------------------------------------------------------

/** Case-insensitive substring match across label + keywords */
function matchesQuery(label: string, keywords: string[], query: string): boolean {
  const q = query.toLowerCase();
  if (label.toLowerCase().includes(q)) return true;
  return keywords.some(k => k.toLowerCase().includes(q));
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export interface CommandPaletteResultsInput {
  query: string;
  recentAssets: PaletteAsset[];
  /** Pre-filtered/sorted from the server for the current query */
  searchAssets: PaletteAsset[];
  searchAssetTotal: number;
  collections: PaletteCollection[];
  navEntries: NavEntry[];
}

const QUERY_CAP = 5;
const RECENT_CAP = 6;

export function commandPaletteResults(input: CommandPaletteResultsInput): PaletteResult {
  const { query, recentAssets, searchAssets, searchAssetTotal, collections, navEntries } = input;

  const trimmed = query.trim();

  if (trimmed === '') {
    return buildEmptyQueryResult(recentAssets);
  }

  return buildQueryResult(trimmed, searchAssets, searchAssetTotal, collections, navEntries);
}

// ---------------------------------------------------------------------------
// Empty-query branch: Recent + Actions
// ---------------------------------------------------------------------------

function buildEmptyQueryResult(recentAssets: PaletteAsset[]): PaletteResult {
  const groups: PaletteGroup[] = [];

  if (recentAssets.length > 0) {
    // Sort pinned first, then take up to RECENT_CAP
    const sorted = [...recentAssets].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    const items: PaletteItem[] = sorted.slice(0, RECENT_CAP).map(asset => ({
      id: `recent-${asset.id}`,
      kind: 'asset',
      label: asset.title,
      asset,
    }));
    groups.push({ id: 'recent', label: 'Recent', items });
  }

  const actionItems: PaletteItem[] = ACTION_ENTRIES.map(a => ({
    id: `action-${a.id}`,
    kind: 'action',
    label: a.label,
    actionId: a.id,
    keywords: a.keywords,
  }));
  groups.push({ id: 'actions', label: 'Actions', items: actionItems });

  return { groups };
}

// ---------------------------------------------------------------------------
// Non-empty query branch: Assets → Collections → Actions → Go To
// ---------------------------------------------------------------------------

function buildQueryResult(
  query: string,
  searchAssets: PaletteAsset[],
  searchAssetTotal: number,
  collections: PaletteCollection[],
  navEntries: NavEntry[]
): PaletteResult {
  const groups: PaletteGroup[] = [];

  // Assets (server-pre-filtered — pass through, just cap)
  if (searchAssets.length > 0) {
    const items: PaletteItem[] = searchAssets.slice(0, QUERY_CAP).map(asset => ({
      id: `asset-${asset.id}`,
      kind: 'asset',
      label: asset.title,
      asset,
    }));
    groups.push({ id: 'assets', label: 'Assets', items, totalCount: searchAssetTotal });
  }

  // Collections (client-side filtered by name)
  const matchedCollections = collections.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );
  if (matchedCollections.length > 0) {
    const items: PaletteItem[] = matchedCollections.slice(0, QUERY_CAP).map(c => ({
      id: `collection-${c.id}`,
      kind: 'collection',
      label: c.name,
      collection: c,
    }));
    groups.push({ id: 'collections', label: 'Collections', items });
  }

  // Actions (client-side fuzzy match)
  const matchedActions = ACTION_ENTRIES.filter(a => matchesQuery(a.label, a.keywords, query));
  if (matchedActions.length > 0) {
    const items: PaletteItem[] = matchedActions.slice(0, QUERY_CAP).map(a => ({
      id: `action-${a.id}`,
      kind: 'action',
      label: a.label,
      actionId: a.id,
      keywords: a.keywords,
    }));
    groups.push({ id: 'actions', label: 'Actions', items });
  }

  // Go To nav entries (client-side fuzzy match)
  const matchedNav = navEntries.filter(n => matchesQuery(`Go to ${n.label}`, [n.label], query));
  if (matchedNav.length > 0) {
    const items: PaletteItem[] = matchedNav.slice(0, QUERY_CAP).map(n => ({
      id: `nav-${n.href}`,
      kind: 'nav',
      label: `Go to ${n.label}`,
      href: n.href,
    }));
    groups.push({ id: 'goto', label: 'Go To', items });
  }

  return { groups };
}
