import { useState } from 'react';
import { toast } from 'sonner';
import { CollectionModal } from '@/components/collection-modal';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { useCreateCollectionMutation } from '@/hooks/mutations/use-collection-mutations';

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const createCollection = useCreateCollectionMutation();

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

      <CollectionModal
        open={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onSubmit={async data => {
          try {
            await createCollection.mutateAsync(data);
            toast.success(`Collection "${data.name}" created`);
            setCollectionModalOpen(false);
          } catch {
            toast.error('Failed to create collection');
          }
        }}
      />
    </div>
  );
}
