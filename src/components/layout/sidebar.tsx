'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNavigation } from './sidebar-navigation';
import { SidebarFooter } from './sidebar-footer';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  collapsed: boolean;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  className?: string;
}

function SidebarContent({ collapsed, user, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  return (
    <aside
      className={cn(
        'hidden h-full shrink-0 overflow-hidden bg-surface-container-low contrast-125 transition-[width,border-color] duration-300 ease-in-out md:flex',
        collapsed ? 'w-0 border-r border-transparent' : 'w-64 border-r border-white/5',
        className
      )}
    >
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col py-6 transition-[opacity,transform] duration-200 ease-in-out',
          collapsed ? 'pointer-events-none -translate-x-2 opacity-0' : 'translate-x-0 opacity-100'
        )}
      >
        <SidebarLogo />
        <div className="mx-6 mb-6 mt-6 border-t border-white/5" />

        <SidebarNavigation activePath={pathname} searchParams={searchParams} />

        <SidebarFooter
          activePath={pathname}
          user={user}
          onSignOut={handleSignOut}
          className="mt-auto"
        />
      </div>
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
