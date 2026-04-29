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
import { isShortcutSuppressed } from '@/shell/shortcut-suppression';
import { signOut } from '@/lib/auth-client';

/** DOM event key dispatched by the vault's "Toggle sidebar" palette command. */
const TOGGLE_SIDEBAR_EVENT = 'cellar:toggle-sidebar';

function useCommandPaletteShortcut() {
  const { setOpen } = useCommandPalette();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isShortcutSuppressed(e.target)) return;

      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);
}

/** Listen for the custom toggle-sidebar event dispatched by the vault manifest. */
function useToggleSidebarEvent() {
  const { toggle } = useSidebarCollapse();

  useEffect(() => {
    function handleToggle() {
      toggle();
    }
    document.addEventListener(TOGGLE_SIDEBAR_EVENT, handleToggle);
    return () => document.removeEventListener(TOGGLE_SIDEBAR_EVENT, handleToggle);
  }, [toggle]);
}

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const navigate = useNavigate();

  // Install global ⌘K / Ctrl+K shortcut
  useCommandPaletteShortcut();

  // Install global ⌘B / Ctrl+B shortcut for the feature sidebar
  useSidebarToggleShortcut();

  // Keep the last-active-feature store in sync with the URL so the `/`
  // redirect and refresh land back on the right feature.
  useSyncLastActiveFeature();

  // Subscribe to the vault palette "Toggle sidebar" event
  useToggleSidebarEvent();

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
      <CommandPalette />
    </div>
  );
}
