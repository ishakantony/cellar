'use client';

import { MobileMenuToggle } from './mobile-menu-toggle';
import { HeaderActions } from './header-actions';

export interface HeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle?: React.ReactNode;
  onAddCollection: () => void;
  className?: string;
}

export function Header({
  onMobileMenuToggle,
  sidebarToggle,
  onAddCollection,
  className,
}: HeaderProps) {
  return (
    <header
      className={`flex items-center h-14 px-6 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/5 ${className}`}
    >
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        <MobileMenuToggle onClick={onMobileMenuToggle} className="md:hidden" />
        {sidebarToggle}
      </div>

      {/* Center - spacer */}
      <div className="flex-1" />

      {/* Right - Actions */}
      <div className="flex-1 flex justify-end">
        <HeaderActions onAddCollection={onAddCollection} />
      </div>
    </header>
  );
}
