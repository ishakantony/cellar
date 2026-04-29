import type {
  FeatureId,
  FeatureManifest,
  FeatureModule,
  FeatureRegistryEntry,
} from '@cellar/shell-contract';
import { createFeatureLoader, type FeatureLoader } from './feature-loader';

/**
 * Registry of features known to the shell. Holds eager manifests for
 * synchronous chrome rendering and lazy loaders for the rest of the module.
 *
 * For the scaffold (issue #002) the registry is created empty by the app;
 * #003/#004/#005 will populate it.
 */
export interface FeatureRegistry {
  list(): FeatureRegistryEntry[];
  getManifests(): FeatureManifest[];
  getById(id: FeatureId): FeatureRegistryEntry | undefined;
  loadModule(id: FeatureId): Promise<FeatureModule>;
  resetModule(id: FeatureId): void;
}

export function createFeatureRegistry(entries: FeatureRegistryEntry[]): FeatureRegistry {
  const byId = new Map<FeatureId, FeatureRegistryEntry>();
  const loaders = new Map<FeatureId, FeatureLoader>();

  for (const entry of entries) {
    if (byId.has(entry.manifest.id)) {
      throw new Error(`duplicate feature id: ${entry.manifest.id}`);
    }
    byId.set(entry.manifest.id, entry);
    loaders.set(entry.manifest.id, createFeatureLoader(entry.load));
  }

  function loadModule(id: FeatureId): Promise<FeatureModule> {
    const loader = loaders.get(id);
    if (!loader) {
      return Promise.reject(new Error(`unknown feature: ${id}`));
    }
    return loader.load();
  }

  function resetModule(id: FeatureId): void {
    loaders.get(id)?.reset();
  }

  return {
    list: () => entries.slice(),
    getManifests: () => entries.map(e => e.manifest),
    getById: id => byId.get(id),
    loadModule,
    resetModule,
  };
}
