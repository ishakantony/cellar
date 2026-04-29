import { MobileMenuToggle } from './mobile-menu-toggle';
import { CommandTrigger } from './command-trigger';

export interface HeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle?: React.ReactNode;
  className?: string;
}

export function Header({ onMobileMenuToggle, sidebarToggle, className }: HeaderProps) {
  return (
    <header
      className={`flex items-center h-14 px-6 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/5 gap-3 ${className}`}
    >
      {/* Left – sidebar toggle / mobile hamburger */}
      <div className="flex items-center gap-4 shrink-0">
        <MobileMenuToggle onClick={onMobileMenuToggle} className="md:hidden" />
        {sidebarToggle}
      </div>

      {/* Center – expands to push trigger to center on desktop */}
      <div className="flex-1 flex items-center justify-center">
        {/* Desktop search pill + mobile magnifier icon – responsive internally */}
        <CommandTrigger />
      </div>
    </header>
  );
}
