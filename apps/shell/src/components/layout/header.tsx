import { MobileMenuToggle } from './mobile-menu-toggle';
import { CommandTrigger } from './command-trigger';
import { SidebarToggle } from './sidebar-toggle';
import { UserMenu } from './user-menu';
import { cn } from '@cellar/ui';

export interface HeaderUser {
  name: string;
  email: string;
  image?: string | null;
}

export interface HeaderProps {
  user: HeaderUser;
  onMobileMenuToggle: () => void;
  onSignOut: () => void;
  onNavigateSettings: () => void;
  className?: string;
}

export function Header({
  user,
  onMobileMenuToggle,
  onSignOut,
  onNavigateSettings,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center h-14 px-4 md:px-6 w-full sticky top-0 z-40',
        'bg-surface/80 backdrop-blur-md border-b border-white/5 gap-3',
        className
      )}
    >
      {/* Left – mobile hamburger / desktop sidebar collapse */}
      <div className="flex items-center gap-2 shrink-0">
        <MobileMenuToggle onClick={onMobileMenuToggle} className="md:hidden" />
        <SidebarToggle className="hidden md:inline-flex" />
      </div>

      {/* Center – command-palette trigger (responsive) */}
      <div className="flex-1 flex items-center justify-center">
        <CommandTrigger />
      </div>

      {/* Right – user menu */}
      <div className="flex items-center shrink-0">
        <UserMenu user={user} onSignOut={onSignOut} onNavigateSettings={onNavigateSettings} />
      </div>
    </header>
  );
}
