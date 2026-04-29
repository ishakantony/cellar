import { type LucideIcon } from 'lucide-react';
import { Label, cn } from '@cellar/ui';
import { NavItem } from './nav-item';
export interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  type?: string;
}

export interface NavSectionProps {
  title: string;
  items: NavItemConfig[];
  activePath: string;
  searchParams?: { get: (key: string) => string | null };
  className?: string;
}

function isItemActive(
  item: NavItemConfig,
  pathname: string,
  searchParams?: NavSectionProps['searchParams']
): boolean {
  // Per-asset-type entries embed `?type=…` in the href; check for an exact
  // pathname match plus matching search-param.
  const [hrefPath, hrefQuery] = item.href.split('?');
  const hrefType = hrefQuery
    ? (new URLSearchParams(hrefQuery).get('type') ?? undefined)
    : undefined;

  if (hrefType) {
    return pathname === hrefPath && searchParams?.get('type') === hrefType;
  }
  if (hrefPath === '/vault/assets') {
    return pathname === '/vault/assets' && !searchParams?.get('type');
  }
  return pathname === hrefPath;
}

export function NavSection({ title, items, activePath, searchParams, className }: NavSectionProps) {
  return (
    <div className={cn('px-4 py-2', className)}>
      <Label className="text-[10px] uppercase tracking-widest text-outline block mb-2 px-4">
        {title}
      </Label>
      {items.map(item => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={isItemActive(item, activePath, searchParams)}
        />
      ))}
    </div>
  );
}
