import { Link } from 'react-router';
import { cn } from '@cellar/ui';
import type { NavItem } from '@cellar/shell-contract';

export interface FeatureNavListProps {
  items: NavItem[];
  pathname: string;
  searchParams?: URLSearchParams | { get: (key: string) => string | null };
  className?: string;
}

function isItemActive(
  item: NavItem,
  pathname: string,
  searchParams?: FeatureNavListProps['searchParams']
): boolean {
  // Items can encode a query in their href (e.g. per-asset-type quick filters);
  // match both the path and the `type=` param for those.
  const [hrefPath, hrefQuery] = item.href.split('?');
  const hrefType = hrefQuery
    ? (new URLSearchParams(hrefQuery).get('type') ?? undefined)
    : undefined;

  if (hrefType) {
    return pathname === hrefPath && searchParams?.get('type') === hrefType;
  }
  // For "list" entries (no type filter), require absence of a type filter to
  // avoid double-highlighting against the per-type entries.
  if (hrefPath === pathname) {
    if (!searchParams) return true;
    return !searchParams.get('type');
  }
  return false;
}

export function FeatureNavList({ items, pathname, searchParams, className }: FeatureNavListProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex-1 space-y-1 overflow-y-auto px-4', className)}>
      {items.map(item => {
        const Icon = item.icon;
        const active = isItemActive(item, pathname, searchParams);
        return (
          <Link
            key={item.id}
            to={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2',
              'text-xs font-bold uppercase tracking-wide transition-colors duration-150',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            )}
          >
            {Icon && <Icon className="h-[18px] w-[18px] shrink-0" />}
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
