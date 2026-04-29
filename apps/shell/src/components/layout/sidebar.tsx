import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { signOut } from '@/lib/auth-client';
import { SidebarLogo } from './sidebar-logo';
import { SidebarNavigation } from './sidebar-navigation';
import { SidebarFooter } from './sidebar-footer';
import { cn } from '@cellar/ui';

export interface SidebarProps {
  collapsed: boolean;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  className?: string;
}

export function Sidebar({ collapsed, user, className }: SidebarProps) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/sign-in');
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
        <SidebarFooter user={user} onSignOut={handleSignOut} className="mt-auto" />
      </div>
    </aside>
  );
}
