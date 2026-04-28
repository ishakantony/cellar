import { useState, useEffect, useCallback } from 'react';
import { CollectionModal } from '@/components/collections/collection-modal';
import { AssetDrawer } from '@/components/assets/asset-drawer';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useCommandPalette } from '@/hooks/use-command-palette';

function useCommandPaletteShortcut() {
  const { setOpen } = useCommandPalette();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Suppress when focus is in a text field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Install global ⌘K / Ctrl+K shortcut
  useCommandPaletteShortcut();

  const toggleSidebar = useCallback(() => setSidebarCollapsed(c => !c), []);

  return (
    <div className="flex h-full">
      <Sidebar collapsed={sidebarCollapsed} user={user} />
      <main className="flex-1 flex flex-col min-w-0 bg-surface h-full">
        <Header
          onMobileMenuToggle={() => {}}
          sidebarCollapsed={sidebarCollapsed}
          sidebarToggle={
            <SidebarToggle
              onClick={toggleSidebar}
              collapsed={sidebarCollapsed}
              className="hidden md:flex"
            />
          }
        />
        <div className="flex-1 overflow-y-auto p-8 pb-20 md:pb-8">{children}</div>
      </main>

      <CollectionModal />
      <AssetDrawer />
      <CommandPalette onToggleSidebar={toggleSidebar} />
    </div>
  );
}
