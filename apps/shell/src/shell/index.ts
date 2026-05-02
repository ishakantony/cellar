/**
 * Public surface of the shell core. Other parts of `apps/shell` should import
 * from `@/shell` rather than reaching into specific files so we can refactor
 * the internals freely.
 */
export { isShortcutSuppressed } from './shortcut-suppression';
export { createFeatureLoader, type FeatureLoader } from './feature-loader';
export { createFeatureRegistry, type FeatureRegistry } from './registry';
export { composeFeatureRoutes } from './route-composer';
export { FeatureErrorBoundary, type FeatureErrorBoundaryProps } from './error-boundary';
export { shellStaticCommands } from './shell-static-commands';
export {
  useLastActiveFeature,
  LAST_ACTIVE_FEATURE_KEY,
  DEFAULT_FEATURE_PATH,
} from './stores/last-active-feature';
