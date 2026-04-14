"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Blue", className: "bg-blue-500" },
  { value: "#a855f7", label: "Purple", className: "bg-purple-500" },
  { value: "#10b981", label: "Green", className: "bg-emerald-500" },
  { value: "#f59e0b", label: "Amber", className: "bg-amber-500" },
  { value: "#ef4444", label: "Red", className: "bg-red-500" },
  { value: "#ec4899", label: "Pink", className: "bg-pink-500" },
];

export function CollectionModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  initialData?: { name: string; description?: string; color?: string };
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [color, setColor] = useState(initialData?.color ?? "#3b82f6");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      setName("");
      setDescription("");
      setColor("#3b82f6");
      onClose();
    } catch {
      // onSubmit failed — keep modal open so user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initialData ? "Edit Collection" : "New Collection"}
        className="bg-surface-container-high rounded-xl p-6 w-[400px] mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-slate-100 mb-4">
          {initialData ? "Edit Collection" : "New Collection"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="collection-name" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Name
            </label>
            <input
              id="collection-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
              placeholder="Collection name"
            />
          </div>
          <div>
            <label htmlFor="collection-description" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Description
            </label>
            <input
              id="collection-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label htmlFor="collection-color" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Color
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`h-8 w-8 rounded-full ${opt.className} transition-all ${
                    color === opt.value
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-high scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-container/30 hover:bg-primary-container/50 border border-primary/30 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {initialData ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
