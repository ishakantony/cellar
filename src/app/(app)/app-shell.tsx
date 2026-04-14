"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarCollapsedToggle } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AssetDrawer } from "@/components/asset-drawer";
import { CollectionModal } from "@/components/collection-modal";
import { createCollection } from "@/app/actions/collections";
import { AssetType } from "@/generated/prisma";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // mobileMenuOpen wired to mobile overlay sidebar (Task 18)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // collectionModalOpen wired to CollectionModal (Task 17)
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
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          sidebarCollapsed={sidebarCollapsed}
          sidebarToggle={
            <SidebarCollapsedToggle
              onToggle={() => setSidebarCollapsed(false)}
            />
          }
          onAddItem={handleAddItem}
          onAddCollection={handleAddCollection}
        />
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>

      {/* Global "Add Item" drawer from header */}
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="create"
        defaultType={"SNIPPET" as AssetType}
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
      />

      {/* Global "New Collection" modal from header */}
      <CollectionModal
        open={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onSubmit={async (data) => {
          await createCollection(data);
          router.refresh();
        }}
      />
    </div>
  );
}
