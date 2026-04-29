import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AssetDrawer, CollectionModal } from '@cellar/feature-vault';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { Header } from '@/components/layout/header';
import { AppSwitcherRail } from '@/components/layout/rail/app-switcher-rail';
import { FeatureSidebar } from '@/components/layout/feature-sidebar/feature-sidebar';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { useSidebarCollapse } from '@/shell/stores/sidebar-collapse';
import { useSyncLastActiveFeature } from '@/shell/use-sync-last-active-feature';
import { useSidebarToggleShortcut } from '@/shell/use-sidebar-toggle-shortcut';
import { signOut } from '@/lib/auth-client';

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
  const { toggle: toggleSidebar } = useSidebarCollapse();
  const navigate = useNavigate();

  // Install global ⌘K / Ctrl+K shortcut
  useCommandPaletteShortcut();

  // Install global ⌘B / Ctrl+B shortcut for the feature sidebar
  useSidebarToggleShortcut();

  // Keep the last-active-feature store in sync with the URL so the `/`
  // redirect and refresh land back on the right feature.
  useSyncLastActiveFeature();

  const handleToggleSidebar = useCallback(() => toggleSidebar(), [toggleSidebar]);

  const handleSignOut = useCallback(() => {
    void signOut().then(() => navigate('/sign-in'));
  }, [navigate]);

  const handleNavigateSettings = useCallback(() => {
    navigate('/account/settings');
  }, [navigate]);

  return (
    <div className="flex h-full">
      <AppSwitcherRail />
      <FeatureSidebar />
      <main className="flex flex-1 flex-col min-w-0 bg-surface h-full">
        <Header
          user={user}
          onMobileMenuToggle={() => {}}
          onSignOut={handleSignOut}
          onNavigateSettings={handleNavigateSettings}
        />
        <div className="flex-1 overflow-y-auto p-8 pb-20 md:pb-8">{children}</div>
      </main>

      <CollectionModal />
      <AssetDrawer />
      <CommandPalette onToggleSidebar={handleToggleSidebar} />
    </div>
  );
}
