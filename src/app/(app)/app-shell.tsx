"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarCollapsedToggle } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AssetDrawer } from "@/components/asset-drawer";
import { CollectionModal } from "@/components/collection-modal";
import { createCollection } from "@/app/actions/collections";
import { AssetType } from "@/generated/prisma";
import { LayoutDashboard, Package, Folder, Settings, Plus } from "lucide-react";

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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-white/5 flex md:hidden items-center justify-around px-4 z-50">
        <a href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Dash</span>
        </a>
        <a href="/assets" className="flex flex-col items-center gap-1 text-outline">
          <Package className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Items</span>
        </a>
        <div className="-mt-8">
          <button
            onClick={handleAddItem}
            className="flex h-12 w-12 items-center justify-center rounded-full btn-gradient shadow-xl shadow-primary-container/40 text-on-primary"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <a href="/collections" className="flex flex-col items-center gap-1 text-outline">
          <Folder className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Collections</span>
        </a>
        <a href="/settings" className="flex flex-col items-center gap-1 text-outline">
          <Settings className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Settings</span>
        </a>
      </nav>
    </div>
  );
}
