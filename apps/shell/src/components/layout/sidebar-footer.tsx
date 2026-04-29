import { UserMenu } from './user-menu';
import { cn } from '@cellar/ui';

export interface SidebarFooterProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  className?: string;
}

/**
 * Sidebar footer hosts only the user chip. The "Settings" link that lived
 * here in the legacy shell was removed in issue #004 — Account is reachable
 * by URL only until issue #006 wires a user-menu entry to `/account/settings`.
 */
export function SidebarFooter({ user, onSignOut, className }: SidebarFooterProps) {
  return (
    <div className={cn('px-4', className)}>
      <UserMenu user={user} onSignOut={onSignOut} />
    </div>
  );
}
