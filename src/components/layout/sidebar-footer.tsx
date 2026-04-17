'use client';

import { Settings } from 'lucide-react';
import { NavItem } from './nav-item';
import { UserMenu } from './user-menu';
import { cn } from '@/lib/utils';

export interface SidebarFooterProps {
  activePath: string;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  className?: string;
}

export function SidebarFooter({ activePath, user, onSignOut, className }: SidebarFooterProps) {
  return (
    <div className={cn('px-4', className)}>
      <div className="border-t border-white/5 pt-3 mb-2 px-4">
        <NavItem
          href="/settings"
          icon={Settings}
          label="Settings"
          active={activePath === '/settings'}
        />
      </div>
      <UserMenu user={user} onSignOut={onSignOut} />
    </div>
  );
}
