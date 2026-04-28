import { useState } from 'react';
import { CollectionModal } from '@/components/collections/collection-modal';
import { AssetDrawer } from '@/components/assets/asset-drawer';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useCollectionModal } from '@/hooks/use-collection-modal';

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { openCreate } = useCollectionModal();

  return (
    <div className="flex h-full">
      <Sidebar collapsed={sidebarCollapsed} user={user} />
      <main className="flex-1 flex flex-col min-w-0 bg-surface h-full">
        <Header
          onMobileMenuToggle={() => {}}
          sidebarCollapsed={sidebarCollapsed}
          sidebarToggle={
            <SidebarToggle
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              collapsed={sidebarCollapsed}
              className="hidden md:flex"
            />
          }
          onAddCollection={openCreate}
        />
        <div className="flex-1 overflow-y-auto p-8 pb-20 md:pb-8">{children}</div>
      </main>

      <CollectionModal />

      <AssetDrawer />
    </div>
  );
}
