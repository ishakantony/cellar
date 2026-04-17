'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileMenuToggle } from './mobile-menu-toggle';
import { SearchInput } from './search-input';
import { HeaderActions } from './header-actions';

export interface HeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle?: React.ReactNode;
  onAddItem: () => void;
  onAddCollection: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export function Header({
  onMobileMenuToggle,
  sidebarCollapsed,
  sidebarToggle,
  onAddItem,
  onAddCollection,
  searchPlaceholder = 'Quick search...',
  className,
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(value: string) {
    if (value.trim()) {
      router.push(`/assets?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <header
      className={`flex items-center h-14 px-6 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/5 ${className}`}
    >
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        <MobileMenuToggle onClick={onMobileMenuToggle} className="md:hidden" />
        {sidebarCollapsed && sidebarToggle}
      </div>

      {/* Center - Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearch}
        placeholder={searchPlaceholder}
      />

      {/* Right - Actions */}
      <div className="flex-1 flex justify-end">
        <HeaderActions onAddCollection={onAddCollection} onAddItem={onAddItem} />
      </div>
    </header>
  );
}
