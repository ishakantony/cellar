/**
 * TanStack Query keys for Account. Owned by the feature so other features
 * can't accidentally invalidate Account caches. Namespaced under `account`.
 */
export const settingsKey = ['account', 'settings'] as const;
