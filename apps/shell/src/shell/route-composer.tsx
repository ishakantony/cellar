import { Suspense, lazy, type ComponentType, type ReactElement } from 'react';
import type { RouteObject } from 'react-router';
import type { FeatureRegistryEntry } from '@cellar/shell-contract';
import { FeatureErrorBoundary } from './error-boundary';
import type { FeatureRegistry } from './registry';

interface FeatureRouteHostProps {
  entry: FeatureRegistryEntry;
  registry: FeatureRegistry;
}

/**
 * Wraps a feature's lazily-loaded routes with the shell-owned error boundary
 * and a Suspense fallback. The actual route subtree comes from the feature
 * module's `routes` array, which we mount under the manifest's basePath.
 */
function FeatureRouteHost({ entry, registry }: FeatureRouteHostProps): ReactElement {
  const Skeleton = entry.manifest.Skeleton;

  // We dynamic-import the module via the registry's memoized loader. React's
  // `lazy` requires a default export of a component; we wrap the routes into
  // an Outlet-equivalent component. For the scaffold, the inner routes array
  // is empty, so the host renders nothing meaningful — the route composer
  // itself is what's load-bearing here.
  const LazyOutlet = lazy(async () => {
    await registry.loadModule(entry.manifest.id);
    // Render nothing once loaded — child routes (if any) take over via the
    // route tree the shell composed below.
    return { default: (() => null) as ComponentType };
  });

  return (
    <FeatureErrorBoundary
      featureId={entry.manifest.id}
      onRetry={() => registry.resetModule(entry.manifest.id)}
    >
      <Suspense fallback={Skeleton ? <Skeleton /> : null}>
        <LazyOutlet />
      </Suspense>
    </FeatureErrorBoundary>
  );
}

/**
 * Compose feature routes into a flat React-Router `RouteObject[]` rooted at
 * each feature's `basePath`. The shell owns the per-feature error boundary
 * and the Suspense fallback; the feature module supplies the children.
 *
 * For the scaffold this is exercised only by tests — the running app keeps
 * using its existing route tree until #003/#004/#005 wire the registry in.
 */
export function composeFeatureRoutes(registry: FeatureRegistry): RouteObject[] {
  return registry.list().map(entry => ({
    path: entry.manifest.basePath,
    element: <FeatureRouteHost entry={entry} registry={registry} />,
    children: [],
  }));
}
