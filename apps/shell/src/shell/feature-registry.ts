import vaultModule from '@cellar/feature-vault';
import vaultManifest from '@cellar/feature-vault/manifest';
import accountModule from '@cellar/feature-account';
import accountManifest from '@cellar/feature-account/manifest';
import toolboxModule from '@cellar/feature-toolbox';
import toolboxManifest from '@cellar/feature-toolbox/manifest';
import type { FeatureRegistryEntry } from '@cellar/shell-contract';
import { createFeatureRegistry, type FeatureRegistry } from './registry';
import type { ResolvedFeatureRegistryEntry } from './route-composer';

/**
 * Build the running app's feature registry. Vault, Account, and Toolbox are
 * wired here.
 *
 * The lazy `load()` is kept on each entry to satisfy the shell-contract — the
 * scaffold supports lazy module loading — but the running shell also imports
 * each module's route declarations eagerly so `composeRegisteredFeatureRoutes`
 * can mount the child routes in the static React Router tree without a
 * Suspense round-trip.
 *
 * Toolbox itself ships its page component behind React Router's `lazy:` (see
 * `@cellar/feature-toolbox`'s `index.tsx`) so the JSON Explorer bundle only
 * loads on first navigation into `/toolbox/json-explorer`. Vault and Account
 * remain fully eager for now — a follow-up can graduate them to the same
 * per-route lazy pattern.
 */
const vaultEntry: FeatureRegistryEntry = {
  manifest: vaultManifest,
  load: async () => vaultModule,
};

const accountEntry: FeatureRegistryEntry = {
  manifest: accountManifest,
  load: async () => accountModule,
};

const toolboxEntry: FeatureRegistryEntry = {
  manifest: toolboxManifest,
  load: async () => toolboxModule,
};

const entries: FeatureRegistryEntry[] = [vaultEntry, accountEntry, toolboxEntry];

export const registry: FeatureRegistry = createFeatureRegistry(entries);

export const resolvedEntries: ResolvedFeatureRegistryEntry[] = [
  { entry: vaultEntry, module: vaultModule },
  { entry: accountEntry, module: accountModule },
  { entry: toolboxEntry, module: toolboxModule },
];
