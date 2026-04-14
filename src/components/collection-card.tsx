"use client";

import { Folder, MoreHorizontal, Pin, PinOff, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const COLLECTION_COLORS: Record<string, string> = {
  "#3b82f6": "bg-blue-500/15 text-blue-400",
  "#a855f7": "bg-purple-500/15 text-purple-400",
  "#10b981": "bg-emerald-500/15 text-emerald-400",
  "#f59e0b": "bg-amber-500/15 text-amber-400",
  "#ef4444": "bg-red-500/15 text-red-400",
  "#ec4899": "bg-pink-500/15 text-pink-400",
};

function getColorClasses(color: string | null | undefined): string {
  if (color && COLLECTION_COLORS[color]) return COLLECTION_COLORS[color];
  return "bg-blue-500/15 text-blue-400";
}

export function CollectionCard({
  collection,
  onClick,
  onTogglePin,
  onDelete,
}: {
  collection: {
    id: string;
    name: string;
    color?: string | null;
    pinned: boolean;
    _count: { assets: number };
  };
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      onClick={onClick}
      className="group flex flex-col gap-3 p-4 bg-surface-container ghost-border rounded-xl hover:bg-surface-bright hover:border-white/20 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${getColorClasses(collection.color)}`}
        >
          <Folder className="h-[18px] w-[18px]" />
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-container-high rounded text-outline hover:text-on-surface transition-all"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container-high rounded-lg shadow-xl border border-white/10 py-1 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-bright transition-colors"
              >
                {collection.pinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
                {collection.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-200 truncate">
          {collection.name}
        </p>
        <p className="text-[10px] text-outline mt-0.5">
          {collection._count.assets} items
        </p>
      </div>
    </div>
  );
}
