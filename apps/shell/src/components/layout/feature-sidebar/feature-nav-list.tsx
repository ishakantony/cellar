import { Link } from 'react-router';
import { cn } from '@cellar/ui';
import type { NavItem, NavSection } from '@cellar/shell-contract';

export interface FeatureNavListProps {
  sections: NavSection[];
  pathname: string;
  className?: string;
}

function isItemActive(item: NavItem, pathname: string): boolean {
  const [hrefPath] = item.href.split('?');
  return hrefPath === pathname;
}

export function FeatureNavList({ sections, pathname, className }: FeatureNavListProps) {
  if (sections.length === 0) return null;

  return (
    <nav className={cn('flex-1 overflow-y-auto px-4', className)}>
      {sections.map((section, i) => (
        <div key={section.title ?? i} className={cn(i > 0 && 'mt-4 border-t border-white/5 pt-4')}>
          {section.title && (
            <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {section.title}
            </p>
          )}
          <div className="space-y-1">
            {section.items.map(item => {
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
          </div>
        </div>
      ))}
    </nav>
  );
}
