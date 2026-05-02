import { Settings as SettingsIcon } from 'lucide-react';
import { Avatar, cn } from '@cellar/ui';

export interface SidebarUserFooterProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onNavigateSettings: () => void;
  className?: string;
}

/**
 * Bottom-of-sidebar user identity row. Shows avatar, display name, secondary
 * line (email), and a settings cog. Cog navigates to /account/settings.
 */
export function SidebarUserFooter({ user, onNavigateSettings, className }: SidebarUserFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-outline-variant px-2.5 py-2',
        className
      )}
    >
      <Avatar src={user.image} name={user.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium leading-tight text-foreground">{user.name}</p>
        <p className="truncate text-[10px] text-on-surface-faint">{user.email}</p>
      </div>
      <button
        type="button"
        onClick={onNavigateSettings}
        aria-label="Account settings"
        className="rounded-sm p-1 text-on-surface-faint transition-colors hover:bg-surface-container-highest hover:text-on-surface-variant"
      >
        <SettingsIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
