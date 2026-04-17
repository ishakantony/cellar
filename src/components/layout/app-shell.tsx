'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarCollapsedToggle } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AssetDrawer } from '@/components/asset-drawer';
import { CollectionModal } from '@/components/collection-modal';
import { createCollection } from '@/app/actions/collections';
import { AssetType } from '@/generated/prisma/enums';
import { LayoutDashboard, Package, Folder, Settings, Plus } from 'lucide-react';

const mobileNavLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dash' },
  { href: '/assets', icon: Package, label: 'Items' },
  null, // placeholder for the center FAB
  { href: '/collections', icon: Folder, label: 'Collections' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const router = useRouter();
  const pathname = usePathname();
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
          await createCollection(data);
          router.refresh();
        }}
      />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-white/5 flex md:hidden items-center justify-around px-4 z-50">
        {mobileNavLinks.map(item =>
          item === null ? (
            <div key="fab" className="-mt-8">
              <button
                onClick={handleAddItem}
                className="flex h-12 w-12 items-center justify-center rounded-full btn-gradient shadow-xl shadow-primary-container/40 text-on-primary"
                aria-label="Add item"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'text-primary'
                  : 'text-outline'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
