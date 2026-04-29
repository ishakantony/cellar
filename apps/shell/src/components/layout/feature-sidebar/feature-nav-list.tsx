import { Link } from 'react-router';
import { cn } from '@cellar/ui';
import type { NavItem } from '@cellar/shell-contract';

export interface FeatureNavListProps {
  items: NavItem[];
  pathname: string;
  className?: string;
}

function isItemActive(item: NavItem, pathname: string): boolean {
  // Strip any query string from the item href; nav items address paths only.
  // Per-page filter state lives in-page (e.g. assets filter tabs), not in the nav.
  const [hrefPath] = item.href.split('?');
  return hrefPath === pathname;
}

export function FeatureNavList({ items, pathname, className }: FeatureNavListProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex-1 space-y-1 overflow-y-auto px-4', className)}>
      {items.map(item => {
        const Icon = item.icon;
        const active = isItemActive(item, pathname);
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
