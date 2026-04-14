"use client";

import { useState } from "react";
import { Search, FolderPlus, SquarePlus, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header({
  onMobileMenuToggle,
  sidebarCollapsed,
  sidebarToggle,
  onAddItem,
  onAddCollection,
}: {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle: React.ReactNode;
  onAddItem: () => void;
  onAddCollection: () => void;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/assets?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="flex items-center h-14 px-6 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 text-slate-400 hover:bg-surface-bright rounded md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {sidebarCollapsed && sidebarToggle}
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-surface-container-low border-none rounded-lg py-2 px-10 text-sm w-80 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline/50 text-on-surface"
          placeholder="Quick search..."
          type="text"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none" />
      </form>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <button
          onClick={onAddCollection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-bright ghost-border rounded text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 transition-all"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Collection</span>
        </button>
        <button
          onClick={onAddItem}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container/20 hover:bg-primary-container/40 border border-primary/20 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
        >
          <SquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Item</span>
        </button>
      </div>
    </header>
  );
}
