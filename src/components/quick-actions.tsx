"use client";

import {
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
} from "lucide-react";
import { AssetType } from "@/generated/prisma";

const actions: { type: AssetType; icon: typeof Code; label: string; primary?: boolean }[] = [
  { type: "SNIPPET", icon: Code, label: "Snippet", primary: true },
  { type: "PROMPT", icon: Terminal, label: "Prompt" },
  { type: "LINK", icon: LinkIcon, label: "Link" },
  { type: "NOTE", icon: StickyNote, label: "Note" },
  { type: "IMAGE", icon: Image, label: "Image" },
  { type: "FILE", icon: FileText, label: "File" },
];

export function QuickActions({
  onAction,
}: {
  onAction: (type: AssetType) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {actions.map((action) => (
        <button
          key={action.type}
          onClick={() => onAction(action.type)}
          className={`group flex flex-col items-center justify-center gap-2 p-4 ghost-border rounded-xl transition-all text-center ${
            action.primary
              ? "bg-primary-container/10 hover:bg-primary-container/20 hover:border-primary/40"
              : "bg-surface-container hover:bg-surface-bright hover:border-white/20"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg group-hover:scale-110 transition-transform ${
              action.primary
                ? "bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/30"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            <action.icon className="h-5 w-5" />
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${
              action.primary
                ? "text-on-primary-container"
                : "text-on-surface-variant"
            }`}
          >
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
