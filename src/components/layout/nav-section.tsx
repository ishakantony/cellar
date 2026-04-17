'use client';

import { type LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { NavItem } from './nav-item';
import { cn } from '@/lib/utils';

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
  if (item.type) {
    return pathname === '/assets' && searchParams?.get('type') === item.type;
  }
  if (item.href === '/assets') {
    return pathname === '/assets' && !searchParams?.get('type');
  }
  return pathname === item.href;
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
