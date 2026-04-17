'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import {
  LayoutDashboard,
  Package,
  Folder,
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/auth/logo-icon';
import { SidebarToggle } from './sidebar-toggle';
import { NavSection } from './nav-section';
import { NavItem } from './nav-item';
import { UserMenu } from './user-menu';

export const generalNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/assets', icon: Package, label: 'All Items' },
  { href: '/collections', icon: Folder, label: 'All Collections' },
];

export const assetNav = [
  { href: '/assets?type=SNIPPET', icon: Code, label: 'Snippets', type: 'SNIPPET' },
  { href: '/assets?type=PROMPT', icon: Terminal, label: 'Prompts', type: 'PROMPT' },
  { href: '/assets?type=LINK', icon: LinkIcon, label: 'Links', type: 'LINK' },
  { href: '/assets?type=NOTE', icon: StickyNote, label: 'Notes', type: 'NOTE' },
  { href: '/assets?type=IMAGE', icon: Image, label: 'Images', type: 'IMAGE' },
  { href: '/assets?type=FILE', icon: FileText, label: 'Files', type: 'FILE' },
];

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
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Logo className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-slate-100">Cellar</h1>
          <SidebarToggle onClick={onToggle} className="ml-auto hidden md:flex" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        <NavSection
          title="General"
          items={generalNav}
          activePath={pathname}
          searchParams={searchParams}
        />
        <NavSection
          title="Assets"
          items={assetNav}
          activePath={pathname}
          searchParams={searchParams}
          className="mt-4"
        />
      </nav>

      {/* Footer */}
      <div className="px-4 mt-auto">
        <div className="border-t border-white/5 pt-3 mb-2 px-4">
          <NavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            active={pathname === '/settings'}
          />
        </div>
        <UserMenu user={user} onSignOut={handleSignOut} />
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

// Re-export for use in Header
export { SidebarToggle };

// Backward compatibility export for app-shell.tsx
export function SidebarCollapsedToggle({ onToggle }: { onToggle: () => void }) {
  return <SidebarToggle onClick={onToggle} collapsed={true} className="hidden md:flex" />;
}
