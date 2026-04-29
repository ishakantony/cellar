import type { FeatureModule } from '@cellar/shell-contract';

/**
 * Wraps a feature's lazy `load()` so that:
 *   - the in-flight promise is memoized (no duplicate dynamic imports),
 *   - failures don't poison the cache permanently — calling `reset()` lets
 *     the next call try again (used by the per-feature error boundary's
 *     "Retry" button),
 *   - errors propagate to the caller verbatim so the boundary can render.
 */
export interface FeatureLoader {
  load(): Promise<FeatureModule>;
  reset(): void;
}

export function createFeatureLoader(loader: () => Promise<FeatureModule>): FeatureLoader {
  let pending: Promise<FeatureModule> | null = null;
  let resolved: FeatureModule | null = null;

  function load(): Promise<FeatureModule> {
    if (resolved) return Promise.resolve(resolved);
    if (pending) return pending;

    pending = loader().then(
      mod => {
        resolved = mod;
        return mod;
      },
      err => {
        // Drop the failed promise so a subsequent reset()+load() can retry.
        pending = null;
        throw err;
      }
    );
    return pending;
  }

  function reset(): void {
    pending = null;
    resolved = null;
  }

  return { load, reset };
}
