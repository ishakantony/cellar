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
export {
  aggregatePaletteResults,
  type NamedPaletteProvider,
  type PaletteGroupResult,
  type PaletteGroupStatus,
} from './palette-aggregator';
export { shellStaticCommands, SHELL_TOGGLE_SIDEBAR_EVENT } from './shell-static-commands';
export {
  useLastActiveFeature,
  LAST_ACTIVE_FEATURE_KEY,
  DEFAULT_FEATURE_PATH,
} from './stores/last-active-feature';
export { useRailPin, RAIL_PIN_KEY } from './stores/rail-pin';
export { useSidebarCollapse, SIDEBAR_COLLAPSE_KEY } from './stores/sidebar-collapse';
