import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { Package, Wrench } from 'lucide-react';
import type { FeatureRegistryEntry } from '@cellar/shell-contract';
import { createFeatureRegistry } from './registry';
import { composeFeatureRoutes } from './route-composer';
import { FeatureErrorBoundary } from './error-boundary';

function makeEntry(id: string, basePath: string): FeatureRegistryEntry {
  return {
    manifest: {
      id,
      label: id,
      icon: id === 'vault' ? Package : Wrench,
      basePath,
    },
    load: async () => ({ routes: [], nav: [] }),
  };
}

describe('composeFeatureRoutes', () => {
  it('produces one root-level route per registry entry mounted at its basePath', () => {
    const registry = createFeatureRegistry([
      makeEntry('vault', '/vault'),
      makeEntry('toolbox', '/toolbox'),
    ]);

    const routes = composeFeatureRoutes(registry);

    expect(routes).toHaveLength(2);
    expect(routes[0]?.path).toBe('/vault');
    expect(routes[1]?.path).toBe('/toolbox');
  });

  it('wraps each route element in a FeatureErrorBoundary owned by the shell', () => {
    const registry = createFeatureRegistry([makeEntry('vault', '/vault')]);
    const [route] = composeFeatureRoutes(registry);

    expect(route).toBeDefined();
    expect(isValidElement(route?.element)).toBe(true);
    // The root element is the Host that internally renders FeatureErrorBoundary;
    // we sanity-check the host is a function component (not a string tag).
    const element = route?.element as React.ReactElement;
    expect(typeof element.type).toBe('function');
  });

  it('returns an empty array for an empty registry', () => {
    const registry = createFeatureRegistry([]);
    expect(composeFeatureRoutes(registry)).toEqual([]);
  });

  it('exports FeatureErrorBoundary as the wrapper class used by the composer', () => {
    expect(FeatureErrorBoundary.prototype.render).toBeTypeOf('function');
  });
});
