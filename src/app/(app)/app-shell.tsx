"use client";

import { useState } from "react";
import { Sidebar, SidebarCollapsedToggle } from "@/components/sidebar";
import { Header } from "@/components/header";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // mobileMenuOpen wired to mobile overlay sidebar (Task 18)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // drawerOpen/drawerMode wired to AssetDrawer (Task 12, fully connected in Task 17)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | null>(null);
  // collectionModalOpen wired to CollectionModal (Task 17)
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  function handleAddItem() {
    setDrawerMode("create");
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
    </div>
  );
}
