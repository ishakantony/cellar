/**
 * Shell <-> Feature contract.
 *
 * Types-only package that defines the boundary between `apps/shell` and the
 * `packages/feature-*` workspaces. Both sides depend on this package; nothing
 * else should leak across the boundary.
 *
 * The split between the eager `FeatureManifest` and the lazy `FeatureModule`
 * lets the shell render rail/sidebar chrome optimistically while the feature
 * code is still being fetched.
 */
import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';

export type FeatureId = string;

/** A single sidebar/nav entry contributed by a feature module. */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
}

/** A labeled group of nav items rendered as a sidebar section. */
export interface NavSection {
  title?: string;
  items: NavItem[];
}

export type PaletteCommandKind = 'navigate' | 'action';

/**
 * A static command surfaced by the manifest (eager). These appear in the
 * command palette before the feature module has been loaded.
 */
export interface PaletteCommand {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  group: string;
  kind: PaletteCommandKind;
  href?: string;
  action?: () => void | Promise<void>;
  /** Whether this command is always visible ('global') or only in its feature context ('feature'). Defaults to 'global'. */
  scope?: 'global' | 'feature';
  /** The feature that owns this command. Required when scope is 'feature'. Must match the FeatureManifest.id. */
  featureId?: string;
}

/**
 * A dynamic palette item produced by a feature's `paletteProvider.search`.
 */
export interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  group: string;
  href?: string;
  action?: () => void | Promise<void>;
}

/**
 * A single result group reported by a feature's palette connector.
 * Connectors can report multiple independent groups (e.g. Assets + Collections)
 * so each group can show its own loading state.
 */
export interface PaletteResultGroup {
  id: string;
  label: string;
  items: PaletteItem[];
  isPending: boolean;
  isError: boolean;
}

/**
 * Props passed to a feature's palette connector component.
 * The connector renders null and reports results via onResults.
 */
export interface PaletteConnectorProps {
  /** Debounced, trimmed query string. Empty string means "show recents". */
  query: string;
  onResults: (groups: PaletteResultGroup[]) => void;
}

/**
 * Eager manifest. Available synchronously to the shell so rail/sidebar chrome
 * can render before the feature module resolves.
 */
export interface FeatureManifest {
  id: FeatureId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  basePath: string;
  /**
   * When `false` the feature is reachable by route/URL but does not appear in
   * the app switcher popover.
   */
  rail?: boolean;
  /**
   * Brand color for this feature. Used by the sidebar app-switcher pill,
   * popover tile, and any feature-themed UI. Accepts any valid CSS color
   * string (most commonly a CSS variable like `var(--color-vault-accent)`).
   */
  accent?: string;
  staticCommands?: PaletteCommand[];
  Skeleton?: ComponentType;
}

/**
 * Lazy module shape — the default export of every `@cellar/feature-*` package.
 */
export interface FeatureModule {
  routes: RouteObject[];
  nav: NavSection[];
  PaletteConnector?: ComponentType<PaletteConnectorProps>;
}

/** Registry entry binds an eager manifest to its lazy loader. */
export interface FeatureRegistryEntry {
  manifest: FeatureManifest;
  load: () => Promise<FeatureModule>;
}
