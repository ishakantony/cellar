import vaultModule from '@cellar/feature-vault';
import vaultManifest from '@cellar/feature-vault/manifest';
import accountModule from '@cellar/feature-account';
import accountManifest from '@cellar/feature-account/manifest';
import type { FeatureRegistryEntry } from '@cellar/shell-contract';
import { createFeatureRegistry, type FeatureRegistry } from './registry';
import type { ResolvedFeatureRegistryEntry } from './route-composer';

/**
 * Build the running app's feature registry. Vault and Account are wired here;
 * Toolbox (issue #008) joins later.
 *
 * The lazy `load()` is kept on each entry to satisfy the shell-contract — the
 * scaffold supports lazy module loading — but the running shell also imports
 * the module eagerly so `composeRegisteredFeatureRoutes` can mount the child
 * routes in the static React Router tree without a Suspense round-trip.
 */
const vaultEntry: FeatureRegistryEntry = {
  manifest: vaultManifest,
  load: async () => vaultModule,
};

const accountEntry: FeatureRegistryEntry = {
  manifest: accountManifest,
  load: async () => accountModule,
};

const entries: FeatureRegistryEntry[] = [vaultEntry, accountEntry];

export const registry: FeatureRegistry = createFeatureRegistry(entries);

export const resolvedEntries: ResolvedFeatureRegistryEntry[] = [
  { entry: vaultEntry, module: vaultModule },
  { entry: accountEntry, module: accountModule },
];
