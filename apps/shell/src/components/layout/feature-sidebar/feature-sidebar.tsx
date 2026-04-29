import { useLocation } from 'react-router';
import { cn } from '@cellar/ui';
import type { NavItem } from '@cellar/shell-contract';
import { useSidebarCollapse } from '@/shell/stores/sidebar-collapse';
import {
  resolvedEntries as defaultResolvedEntries,
  registry as defaultRegistry,
} from '@/shell/feature-registry';
import type { ResolvedFeatureRegistryEntry } from '@/shell/route-composer';
import type { FeatureRegistry } from '@/shell/registry';
import { useLastActiveFeature } from '@/shell/stores/last-active-feature';
import { FeatureNavList } from './feature-nav-list';

export interface FeatureSidebarProps {
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
  // Prefer the longest matching basePath so nested features (if added later)
  // win over shorter prefixes.
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
 * Per-feature sidebar host. Reads the active feature from the URL and renders
 * its `module.nav`. Width transition mirrors the rail's so the two zones feel
 * coordinated.
 *
 * The skeleton + error code paths are wired even though the shell currently
 * resolves modules eagerly (see `feature-registry.ts`). When #014 (or a later
 * issue) flips to lazy module loading, this host already speaks the protocol.
 */
export function FeatureSidebar({ resolved, className }: FeatureSidebarProps) {
  const list = resolved ?? defaultResolvedEntries;
  const { collapsed } = useSidebarCollapse();
  const { pathname } = useLocation();
  const { path: lastActivePath } = useLastActiveFeature();

  // Active feature: route match -> last-active fallback -> first rail-visible.
  const active =
    findActiveFeature(pathname, list) ??
    findActiveFeature(lastActivePath, list) ??
    list.find(e => e.entry.manifest.rail !== false);

  const nav: NavItem[] = active?.module.nav ?? [];

  return (
    <aside
      aria-label={active ? `${active.entry.manifest.label} navigation` : 'Feature navigation'}
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'hidden h-full shrink-0 overflow-hidden border-r border-white/5',
        'bg-surface-container-low/60',
        'transition-[width,border-color] duration-300 ease-in-out md:flex',
        collapsed ? 'w-0 border-transparent' : 'w-56',
        className
      )}
    >
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col py-6 transition-[opacity,transform] duration-200 ease-in-out',
          collapsed ? 'pointer-events-none -translate-x-2 opacity-0' : 'translate-x-0 opacity-100'
        )}
      >
        <FeatureSidebarHeader label={active?.entry.manifest.label ?? ''} />
        <FeatureNavList items={nav} pathname={pathname} />
      </div>
    </aside>
  );
}

function FeatureSidebarHeader({ label }: { label: string }) {
  if (!label) return null;
  return (
    <div className="px-6 pb-4">
      <p className="text-[10px] uppercase tracking-widest text-outline">{label}</p>
    </div>
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
        <div key={i} className="h-6 rounded bg-muted/40 animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Re-export the default registry so external callers can pair the sidebar
 * with a custom retry handler in error cases. Not used by the running shell
 * yet — kept for the future lazy path.
 */
export { defaultRegistry as featureSidebarDefaultRegistry };
