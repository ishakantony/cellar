"use client";

import { Trash2 } from "lucide-react";

export function DeleteDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-surface-container-high rounded-xl p-6 w-[360px] mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Delete &ldquo;{title}&rdquo;?
            </h3>
            <p className="text-xs text-outline mt-1 leading-relaxed">
              This action cannot be undone. The item will be permanently removed
              from your vault.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-error/20 hover:bg-error/30 border border-error/30 hover:border-error/50 rounded text-xs font-bold uppercase tracking-widest text-error transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
