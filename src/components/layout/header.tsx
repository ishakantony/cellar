"use client";

import { useState } from "react";
import { Search, FolderPlus, SquarePlus, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none z-10" />
        <Input
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Quick search..."
          className="w-80 pl-10"
        />
      </form>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <Button
          onClick={onAddCollection}
          variant="ghost"
          size="sm"
          className="hidden sm:flex"
        >
          <FolderPlus className="h-4 w-4" />
          Collection
        </Button>
        <Button
          onClick={onAddCollection}
          variant="ghost"
          size="sm"
          className="sm:hidden"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
        <Button
          onClick={onAddItem}
          variant="primary"
          size="sm"
          className="hidden sm:flex"
        >
          <SquarePlus className="h-4 w-4" />
          Add Item
        </Button>
        <Button
          onClick={onAddItem}
          variant="primary"
          size="sm"
          className="sm:hidden"
        >
          <SquarePlus className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
