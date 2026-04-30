import { Navigate } from 'react-router';
import { Braces, Binary, Link } from 'lucide-react';
import type { FeatureModule } from '@cellar/shell-contract';

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
    {
      path: 'base64',
      lazy: async () => {
        const m = await import('./routes/base64');
        return { Component: m.Base64Page };
      },
    },
    {
      path: 'url-encoder',
      lazy: async () => {
        const m = await import('./routes/url-encoder');
        return { Component: m.UrlEncoderPage };
      },
    },
  ],
  nav: [
    {
      title: 'Explorers',
      items: [
        {
          id: 'json-explorer',
          label: 'JSON Explorer',
          href: '/toolbox/json-explorer',
          icon: Braces,
        },
      ],
    },
    {
      title: 'Encoders',
      items: [
        {
          id: 'base64',
          label: 'Base64',
          href: '/toolbox/base64',
          icon: Binary,
        },
        {
          id: 'url-encoder',
          label: 'URL Encoder',
          href: '/toolbox/url-encoder',
          icon: Link,
        },
      ],
    },
  ],
};

export default featureModule;
