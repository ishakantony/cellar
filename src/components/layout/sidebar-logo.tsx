'use client';

import { Logo } from '@/components/auth/logo-icon';
import { SidebarToggle } from './sidebar-toggle';
import { cn } from '@/lib/utils';

export interface SidebarLogoProps {
  onToggle: () => void;
  showToggle?: boolean;
  className?: string;
}

export function SidebarLogo({ onToggle, showToggle = true, className }: SidebarLogoProps) {
  return (
    <div className={cn('px-6 mb-8', className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Logo className="h-4 w-4" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-100">Cellar</h1>
        {showToggle && <SidebarToggle onClick={onToggle} className="ml-auto hidden md:flex" />}
      </div>
    </div>
  );
}
