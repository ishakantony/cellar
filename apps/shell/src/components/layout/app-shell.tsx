import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AssetDrawer, CollectionModal } from '@cellar/feature-vault';
import { CommandPalette } from '@/components/command-palette/command-palette';
import { Header } from '@/components/layout/header';
import { FeatureSidebar } from '@/components/layout/feature-sidebar/feature-sidebar';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { useSyncLastActiveFeature } from '@/shell/use-sync-last-active-feature';
import { isShortcutSuppressed } from '@/shell/shortcut-suppression';
import { signOut } from '@/lib/auth-client';

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

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const navigate = useNavigate();

  useCommandPaletteShortcut();
  useSyncLastActiveFeature();

  const handleSignOut = useCallback(() => {
    void signOut().then(() => navigate('/sign-in'));
  }, [navigate]);

  const handleNavigateSettings = useCallback(() => {
    navigate('/account/settings');
  }, [navigate]);

  return (
    <div className="flex h-full">
      <FeatureSidebar user={user} onNavigateSettings={handleNavigateSettings} />
      <main className="flex flex-1 flex-col min-w-0 bg-surface h-full">
        <Header user={user} onSignOut={handleSignOut} onNavigateSettings={handleNavigateSettings} />
        <div className="dash-bg flex-1 overflow-y-auto p-8 pb-20 md:pb-8">{children}</div>
      </main>

      <CollectionModal />
      <AssetDrawer />
      <CommandPalette />
    </div>
  );
}
