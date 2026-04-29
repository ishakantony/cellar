import type { FeatureModule } from '@cellar/shell-contract';
import { SettingsPage } from './routes/settings';

/**
 * Account feature module. Routes are mounted under `/account` by the shell's
 * route composer (paths are relative to `manifest.basePath`). Account has no
 * rail entry — it is reachable by URL only (the user-menu link to settings
 * lands in issue #006).
 */
const featureModule: FeatureModule = {
  routes: [{ path: 'settings', element: <SettingsPage /> }],
  nav: [],
};

export default featureModule;

export { settingsKey } from './lib/query-keys';
export type { SettingsData } from './hooks/queries/use-settings';
