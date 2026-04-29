import { Suspense, lazy, type ComponentType, type ReactElement } from 'react';
import { Outlet, type RouteObject } from 'react-router';
import type { FeatureModule, FeatureRegistryEntry } from '@cellar/shell-contract';
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
  // `lazy` requires a default export of a component; we wrap the loaded
  // module into a component that simply renders <Outlet/> so the composed
  // child routes (the feature's own `module.routes`) render in the shell's
  // route tree.
  const LazyOutlet = lazy(async () => {
    await registry.loadModule(entry.manifest.id);
    return { default: (() => <Outlet />) as ComponentType };
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
 * The lazy variant: only the manifest is known up-front. Used by tests and
 * by callers that defer full module loading. For the running app, see
 * {@link composeRegisteredFeatureRoutes} which mounts eagerly-imported
 * feature modules so their child routes participate in the route tree.
 */
export function composeFeatureRoutes(registry: FeatureRegistry): RouteObject[] {
  return registry.list().map(entry => ({
    path: entry.manifest.basePath,
    element: <FeatureRouteHost entry={entry} registry={registry} />,
    children: [],
  }));
}

/**
 * A registry entry plus its eagerly-imported feature module. Used when the
 * shell wants to inline-mount a feature's child routes into the static route
 * tree (the running-app path).
 */
export interface ResolvedFeatureRegistryEntry {
  entry: FeatureRegistryEntry;
  module: FeatureModule;
}

/**
 * Compose feature routes for resolved (eagerly-imported) feature modules.
 * Each entry contributes its `module.routes` as children of a host route at
 * its `manifest.basePath`. The host wraps everything in the shell-owned
 * error boundary so a crash in one feature can't blow up the whole shell.
 */
export function composeRegisteredFeatureRoutes(
  registry: FeatureRegistry,
  resolved: ResolvedFeatureRegistryEntry[]
): RouteObject[] {
  return resolved.map(({ entry, module }) => ({
    path: entry.manifest.basePath,
    element: <FeatureRouteHost entry={entry} registry={registry} />,
    children: module.routes,
  }));
}
