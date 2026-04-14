"use client";

import {
  FileCode,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
  Braces,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { AssetType } from "@/generated/prisma";
import { useState, useRef, useEffect } from "react";

const TYPE_CONFIG: Record<
  AssetType,
  { icon: typeof FileCode; iconWrap: string; label: string }
> = {
  SNIPPET: {
    icon: Braces,
    iconWrap: "bg-primary/10 text-primary",
    label: "Snippet",
  },
  PROMPT: {
    icon: Terminal,
    iconWrap: "bg-tertiary-container/20 text-tertiary",
    label: "Prompt",
  },
  NOTE: {
    icon: StickyNote,
    iconWrap: "bg-amber-500/10 text-amber-400",
    label: "Note",
  },
  LINK: {
    icon: LinkIcon,
    iconWrap: "bg-cyan-500/10 text-cyan-400",
    label: "Link",
  },
  IMAGE: {
    icon: Image,
    iconWrap: "bg-rose-500/10 text-rose-400",
    label: "Image",
  },
  FILE: {
    icon: FileText,
    iconWrap: "bg-violet-500/10 text-violet-400",
    label: "File",
  },
};

export function AssetCard({
  asset,
  onClick,
  onTogglePin,
  onDelete,
  compact = false,
}: {
  asset: {
    id: string;
    type: AssetType;
    title: string;
    language?: string | null;
    pinned: boolean;
    updatedAt: Date;
  };
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  compact?: boolean;
}) {
  const config = TYPE_CONFIG[asset.type];
  const Icon = config.icon;
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

  const subtitle =
    asset.type === "SNIPPET" && asset.language
      ? `${config.label} • ${asset.language}`
      : config.label;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container ghost-border rounded-lg group transition-all cursor-pointer"
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${config.iconWrap}`}
        >
          <Icon className="h-[14px] w-[14px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">
            {asset.title}
          </p>
          <p className="text-[10px] text-outline truncate">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-3 bg-surface-container-low hover:bg-surface-container-high ghost-border rounded-lg group transition-all cursor-pointer"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${config.iconWrap}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-200 truncate">
          {asset.title}
        </h4>
        <p className="text-[10px] text-outline font-mono truncate">
          {subtitle}
        </p>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 hover:bg-surface-bright rounded text-outline hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-[18px] w-[18px]" />
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
              {asset.pinned ? (
                <PinOff className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
              {asset.pinned ? "Unpin" : "Pin"}
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
  );
}
