import { Link } from 'react-router';
import { cn } from '@cellar/ui';
import type { NavItem, NavSection } from '@cellar/shell-contract';

export interface FeatureNavListProps {
  sections: NavSection[];
  pathname: string;
  /** CSS color used to tint active item icons + count chips. */
  accent?: string;
  className?: string;
}

function isItemActive(item: NavItem, pathname: string): boolean {
  const [hrefPath] = item.href.split('?');
  return hrefPath === pathname;
}

export function FeatureNavList({ sections, pathname, accent, className }: FeatureNavListProps) {
  if (sections.length === 0) return null;

  return (
    <nav
      className={cn('flex-1 overflow-y-auto px-2 pt-1 pb-2', className)}
      aria-label="Feature navigation"
    >
      {sections.map((section, i) => (
        <div key={section.title ?? i} className="mt-3 first:mt-2">
          {section.title && (
            <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-on-surface-faint">
              {section.title}
            </p>
          )}
          <div className="space-y-px">
            {section.items.map(item => {
              const Icon = item.icon;
              const active = isItemActive(item, pathname);
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex items-center gap-2 rounded-md px-2 py-1.5',
                    'text-[13px] transition-colors',
                    active
                      ? 'bg-surface-container-highest text-foreground font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-foreground font-normal'
                  )}
                >
                  {Icon && (
                    <span
                      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center"
                      style={{
                        color: active && accent ? accent : 'var(--color-on-surface-muted)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
