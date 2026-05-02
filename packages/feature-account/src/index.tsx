import { Navigate } from 'react-router';
import { Settings } from 'lucide-react';
import type { FeatureModule, NavSection } from '@cellar/shell-contract';
import { SettingsPage } from './routes/settings';

/**
 * Account feature module. Routes are mounted under `/account` by the shell's
 * route composer (paths are relative to `manifest.basePath`).
 */
const featureModule: FeatureModule = {
  routes: [
    { index: true, element: <Navigate to="settings" replace /> },
    { path: 'settings', element: <SettingsPage /> },
  ],
  nav: [
    {
      title: 'Account',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          href: '/account/settings',
          icon: Settings,
        },
      ],
    },
  ] as NavSection[],
};

export default featureModule;

export { settingsKey } from './lib/query-keys';
export type { SettingsData } from './hooks/queries/use-settings';
