import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLastActiveFeature } from './stores/last-active-feature';
import { resolvedEntries } from './feature-registry';

/**
 * Watches the URL and writes the active rail-visible feature's basePath into
 * the last-active-feature store. The persisted path is what the shell falls
 * back to on `/` redirect / refresh. Only rail-visible features qualify so
 * Account doesn't trap the user back into `/account` on next visit.
 */
export function useSyncLastActiveFeature(): void {
  const { pathname } = useLocation();
  const setPath = useLastActiveFeature(s => s.setPath);

  useEffect(() => {
    for (const { entry } of resolvedEntries) {
      const { manifest } = entry;
      if (manifest.rail === false) continue;
      const base = manifest.basePath;
      if (pathname === base || pathname.startsWith(base + '/') || pathname.startsWith(base + '?')) {
        setPath(base);
        return;
      }
    }
  }, [pathname, setPath]);
}
