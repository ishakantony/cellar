import { CommandTrigger } from './command-trigger';
import { UserMenu } from './user-menu';
import { cn } from '@cellar/ui';

export interface HeaderUser {
  name: string;
  email: string;
  image?: string | null;
}

export interface HeaderProps {
  user: HeaderUser;
  onSignOut: () => void;
  onNavigateSettings: () => void;
  className?: string;
}

export function Header({ user, onSignOut, onNavigateSettings, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-12 w-full shrink-0 items-center gap-3',
        'border-b border-outline-variant bg-surface px-5',
        className
      )}
    >
      {/* Left spacer keeps the trigger pinned to the right of the topbar */}
      <div className="flex-1" />

      <CommandTrigger />

      <div className="flex flex-1 items-center justify-end">
        <UserMenu user={user} onSignOut={onSignOut} onNavigateSettings={onNavigateSettings} />
      </div>
    </header>
  );
}
