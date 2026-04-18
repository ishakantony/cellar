'use client';

import { createCollection } from '@/app/actions/collections';
import { AssetDrawer } from '@/components/asset-drawer';
import { CollectionModal } from '@/components/collection-modal';
import { Header } from '@/components/layout/header';
import { Sidebar, SidebarCollapsedToggle } from '@/components/layout/sidebar';
import { AssetType } from '@/generated/prisma/enums';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  function handleAddItem() {
    setDrawerOpen(true);
  }

  function handleAddCollection() {
    setCollectionModalOpen(true);
  }

  return (
    <div className="flex h-full">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-surface h-full">
        <Header
          onMobileMenuToggle={() => {}}
          sidebarCollapsed={sidebarCollapsed}
          sidebarToggle={<SidebarCollapsedToggle onToggle={() => setSidebarCollapsed(false)} />}
          onAddItem={handleAddItem}
          onAddCollection={handleAddCollection}
        />
        <div className="flex-1 overflow-y-auto p-8 pb-20 md:pb-8">{children}</div>
      </main>

      {/* Global "Add Item" drawer from header */}
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="create"
        defaultType={'SNIPPET' as AssetType}
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
      />

      {/* Global "New Collection" modal from header */}
      <CollectionModal
        open={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onSubmit={async data => {
          try {
            await createCollection(data);
            toast.success(`Collection "${data.name}" created`);
            router.refresh();
          } catch {
            toast.error('Failed to create collection');
          }
        }}
      />
    </div>
  );
}
