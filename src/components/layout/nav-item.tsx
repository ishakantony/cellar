'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  className?: string;
}

export function NavItem({ href, icon: Icon, label, active = false, className }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase transition-all duration-150',
        active
          ? 'text-primary bg-primary/10 border-r-2 border-primary'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
        className
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </Link>
  );
}
