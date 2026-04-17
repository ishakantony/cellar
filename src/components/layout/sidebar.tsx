'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNavigation } from './sidebar-navigation';
import { SidebarFooter } from './sidebar-footer';
import { SidebarToggle } from './sidebar-toggle';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  className?: string;
}

function SidebarContent({ collapsed, onToggle, user, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  return (
    <aside
      className={`${
        collapsed ? 'hidden md:hidden' : 'flex md:flex'
      } flex-col h-full py-6 bg-surface-container-low contrast-125 w-64 border-r border-white/5 shrink-0 ${className}`}
    >
      {/* Logo */}
      <SidebarLogo onToggle={onToggle} showToggle={true} />

      {/* Navigation */}
      <SidebarNavigation activePath={pathname} searchParams={searchParams} />

      {/* Footer */}
      <SidebarFooter
        activePath={pathname}
        user={user}
        onSignOut={handleSignOut}
        className="mt-auto"
      />
    </aside>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <SidebarContent {...props} />
    </Suspense>
  );
}

// Re-export for use in Header
export { SidebarToggle };

// Backward compatibility export for app-shell.tsx
export function SidebarCollapsedToggle({ onToggle }: { onToggle: () => void }) {
  return <SidebarToggle onClick={onToggle} collapsed={true} className="hidden md:flex" />;
}
