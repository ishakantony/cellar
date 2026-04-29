import { NavSection } from './nav-section';
import { cn } from '@cellar/ui';
import { generalNav, assetNav } from '@/lib/nav-config';

export interface SidebarNavigationProps {
  activePath: string;
  searchParams?: { get: (key: string) => string | null };
  className?: string;
}

export function SidebarNavigation({ activePath, searchParams, className }: SidebarNavigationProps) {
  return (
    <nav className={cn('flex-1 overflow-y-auto space-y-1', className)}>
      <NavSection
        title="General"
        items={generalNav}
        activePath={activePath}
        searchParams={searchParams}
      />
      <NavSection
        title="Assets"
        items={assetNav}
        activePath={activePath}
        searchParams={searchParams}
        className="mt-4"
      />
    </nav>
  );
}
