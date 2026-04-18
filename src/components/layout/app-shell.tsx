'use client';

import { createCollection } from '@/app/actions/collections';
import { CollectionModal } from '@/components/collection-modal';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
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
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  function handleAddCollection() {
    setCollectionModalOpen(true);
  }

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
          onAddCollection={handleAddCollection}
        />
        <div className="flex-1 overflow-y-auto p-8 pb-20 md:pb-8">{children}</div>
      </main>

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
