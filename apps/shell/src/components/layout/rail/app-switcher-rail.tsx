import { useLocation, useNavigate } from 'react-router';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Tooltip, cn } from '@cellar/ui';
import type { FeatureRegistryEntry } from '@cellar/shell-contract';
import { Logo } from '@/components/auth/logo-icon';
import { useRailPin } from '@/shell/stores/rail-pin';
import { registry as defaultRegistry } from '@/shell/feature-registry';

export interface AppSwitcherRailProps {
  /**
   * Optional override for tests. Defaults to the shell's running registry.
   * Only entries with `manifest.rail !== false` render in the rail.
   */
  entries?: FeatureRegistryEntry[];
  className?: string;
}

function isPathActive(pathname: string, basePath: string): boolean {
  if (pathname === basePath) return true;
  return pathname.startsWith(basePath + '/') || pathname.startsWith(basePath + '?');
}

export function AppSwitcherRail({ entries, className }: AppSwitcherRailProps) {
  const { pinned, toggle } = useRailPin();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const list = entries ?? defaultRegistry.list();
  const railEntries = list.filter(e => e.manifest.rail !== false);

  return (
    <aside
      data-pinned={pinned ? 'true' : 'false'}
      aria-label="App switcher"
      className={cn(
        'hidden h-full shrink-0 flex-col items-stretch border-r border-white/5',
        'bg-surface-container-low contrast-125',
        'transition-[width] duration-200 ease-out md:flex',
        pinned ? 'w-[180px]' : 'w-14',
        className
      )}
    >
      {/* Top slot: Cellar mark */}
      <div className="flex h-14 items-center px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Logo className="h-4 w-4" />
        </div>
        {pinned && (
          <span className="ml-3 truncate text-sm font-black uppercase tracking-tighter text-slate-100">
            Cellar
          </span>
        )}
      </div>

      <div className="mx-2 mb-2 border-t border-white/5" />

      {/* Feature icons */}
      <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Features">
        {railEntries.map(entry => {
          const { manifest } = entry;
          const Icon = manifest.icon;
          const active = isPathActive(pathname, manifest.basePath);
          return (
            <Tooltip
              key={manifest.id}
              content={manifest.label}
              side="right"
              disabled={pinned}
              className="block"
            >
              <button
                type="button"
                aria-label={manifest.label}
                aria-current={active ? 'page' : undefined}
                data-feature-id={manifest.id}
                data-active={active ? 'true' : 'false'}
                onClick={() => navigate(manifest.basePath)}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-lg px-2 py-2',
                  'transition-colors duration-150',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                )}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-primary"
                  />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                {pinned && (
                  <span className="truncate text-xs font-bold uppercase tracking-wide">
                    {manifest.label}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom slot: pin toggle */}
      <div className="border-t border-white/5 p-2">
        <Tooltip
          content={pinned ? 'Collapse rail' : 'Expand rail'}
          side="right"
          disabled={pinned}
          className="block"
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={pinned ? 'Collapse rail' : 'Expand rail'}
            aria-pressed={pinned}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-2 py-2',
              'text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-slate-100'
            )}
          >
            {pinned ? (
              <ChevronsLeft className="h-5 w-5 shrink-0" />
            ) : (
              <ChevronsRight className="h-5 w-5 shrink-0" />
            )}
            {pinned && (
              <span className="truncate text-xs font-bold uppercase tracking-wide">Collapse</span>
            )}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
