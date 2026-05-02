import { useLocation } from 'react-router';
import { cn } from '@cellar/ui';
import type { NavSection } from '@cellar/shell-contract';
import {
  resolvedEntries as defaultResolvedEntries,
  registry as defaultRegistry,
} from '@/shell/feature-registry';
import type { ResolvedFeatureRegistryEntry } from '@/shell/route-composer';
import type { FeatureRegistry } from '@/shell/registry';
import { useLastActiveFeature } from '@/shell/stores/last-active-feature';
import { AppSwitcher } from './app-switcher';
import { FeatureNavList } from './feature-nav-list';
import { SidebarUserFooter } from './sidebar-user-footer';

export interface FeatureSidebarUser {
  name: string;
  email: string;
  image?: string | null;
}

export interface FeatureSidebarProps {
  user: FeatureSidebarUser;
  onNavigateSettings: () => void;
  /** Optional override for tests. Defaults to the shell's running entries. */
  resolved?: ResolvedFeatureRegistryEntry[];
  /** Optional override used when the sidebar host wants a non-default registry. */
  registry?: FeatureRegistry;
  className?: string;
}

function findActiveFeature(
  pathname: string,
  resolved: ResolvedFeatureRegistryEntry[]
): ResolvedFeatureRegistryEntry | undefined {
  let best: ResolvedFeatureRegistryEntry | undefined;
  for (const entry of resolved) {
    const base = entry.entry.manifest.basePath;
    if (pathname === base || pathname.startsWith(base + '/') || pathname.startsWith(base + '?')) {
      if (!best || base.length > best.entry.manifest.basePath.length) {
        best = entry;
      }
    }
  }
  return best;
}

/**
 * Single 220px sidebar with three zones:
 *   1. App-switcher pill + popover (top)
 *   2. Feature nav list (middle, scrolls)
 *   3. User footer with settings cog (bottom)
 *
 * The active feature is derived from the URL with a fallback to the
 * last-active feature, then to the first rail-visible registry entry.
 */
export function FeatureSidebar({
  user,
  onNavigateSettings,
  resolved,
  registry,
  className,
}: FeatureSidebarProps) {
  const list = resolved ?? defaultResolvedEntries;
  const reg = registry ?? defaultRegistry;
  const { pathname } = useLocation();
  const { path: lastActivePath } = useLastActiveFeature();

  const active =
    findActiveFeature(pathname, list) ??
    findActiveFeature(lastActivePath, list) ??
    list.find(e => e.entry.manifest.rail !== false);

  const nav: NavSection[] = active?.module.nav ?? [];
  const accent = active?.entry.manifest.accent;
  const switcherEntries = reg.list().filter(e => e.manifest.rail !== false);

  return (
    <aside
      aria-label={active ? `${active.entry.manifest.label} navigation` : 'Feature navigation'}
      className={cn(
        'hidden h-full w-[220px] shrink-0 flex-col border-r border-outline-variant',
        'bg-surface-container-low md:flex',
        className
      )}
    >
      <div className="px-2.5 pt-2.5">
        <AppSwitcher entries={switcherEntries} active={active?.entry} />
      </div>

      <FeatureNavList sections={nav} pathname={pathname} accent={accent} />

      <SidebarUserFooter user={user} onNavigateSettings={onNavigateSettings} />
    </aside>
  );
}

/**
 * Generic skeleton fallback rendered while a feature module is still being
 * loaded. Becomes visible once the registry resolves modules lazily.
 */
export function FeatureSidebarSkeleton() {
  return (
    <div className="space-y-2 px-4 py-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-6 rounded bg-surface-container-high animate-pulse" />
      ))}
    </div>
  );
}

export { defaultRegistry as featureSidebarDefaultRegistry };
