import { Navigate } from 'react-router';
import { Braces } from 'lucide-react';
import type { FeatureModule } from '@cellar/shell-contract';

/**
 * Toolbox feature module. Routes are mounted under `/toolbox` by the shell's
 * route composer.
 *
 * The page component itself is loaded via React Router's `lazy:` so the
 * Toolbox page bundle is split out of the main shell chunk and only fetched
 * on first navigation into `/toolbox/json-explorer`. The real JSON Explorer
 * implementation lands in issue #010; until then the lazy chunk only carries
 * the placeholder page.
 */
const featureModule: FeatureModule = {
  routes: [
    { index: true, element: <Navigate to="json-explorer" replace /> },
    {
      path: 'json-explorer',
      lazy: async () => {
        const m = await import('./routes/json-explorer');
        return { Component: m.JsonExplorerPage };
      },
    },
  ],
  nav: [
    {
      items: [
        {
          id: 'json-explorer',
          label: 'JSON Explorer',
          href: '/toolbox/json-explorer',
          icon: Braces,
        },
      ],
    },
  ],
};

export default featureModule;
