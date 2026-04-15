"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssetType } from "@/generated/prisma";
import { AssetCard } from "@/components/assets/asset-card";
import { AssetDrawer } from "@/components/asset-drawer";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { togglePin, deleteAsset, getAsset } from "@/app/actions/assets";

const TYPE_TABS: { label: string; value: AssetType | null }[] = [
  { label: "All", value: null },
  { label: "Snippets", value: "SNIPPET" },
  { label: "Prompts", value: "PROMPT" },
  { label: "Notes", value: "NOTE" },
  { label: "Links", value: "LINK" },
  { label: "Images", value: "IMAGE" },
  { label: "Files", value: "FILE" },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A → Z", value: "az" },
  { label: "Z → A", value: "za" },
];

type AssetItem = {
  id: string;
  type: AssetType;
  title: string;
  description: string | null;
  content: string | null;
  language: string | null;
  url: string | null;
  filePath: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  pinned: boolean;
  updatedAt: Date;
};

export function AssetsClient({
  assets,
  currentType,
  currentSort,
  searchQuery,
}: {
  assets: AssetItem[];
  currentType: AssetType | null;
  currentSort: string;
  searchQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null) params.delete(key);
      else params.set(key, val);
    }
    router.push(`/assets?${params.toString()}`);
  }

  async function handleAssetClick(asset: AssetItem) {
    const full = await getAsset(asset.id);
    if (full) {
      const { id, type, title, description, content, language, url, filePath, fileName, mimeType, fileSize, pinned, updatedAt } = full;
      setSelectedAsset({ id, type, title, description, content, language, url, filePath, fileName, mimeType, fileSize, pinned, updatedAt });
      setDrawerOpen(true);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteAsset(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          {searchQuery
            ? `Search: "${searchQuery}"`
            : currentType
              ? `${currentType.charAt(0) + currentType.slice(1).toLowerCase()}s`
              : "All Items"}
        </h2>
        <p className="text-xs text-outline mt-1">
          {assets.length} item{assets.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() =>
                updateParams({ type: tab.value, q: null })
              }
              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                currentType === tab.value
                  ? "bg-primary/10 text-primary"
                  : "text-outline hover:text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded bg-surface-container border-none text-on-surface-variant focus:ring-1 focus:ring-primary/50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Asset list */}
      <div className="space-y-2">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onClick={() => handleAssetClick(asset)}
            onTogglePin={async () => {
              await togglePin(asset.id);
              router.refresh();
            }}
            onDelete={() =>
              setDeleteTarget({ id: asset.id, title: asset.title })
            }
          />
        ))}
        {assets.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xs text-outline">
              {searchQuery
                ? "No results found."
                : "No assets yet. Create one from the dashboard!"}
            </p>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        asset={selectedAsset}
        mode="view"
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
        onDelete={
          selectedAsset
            ? () => {
                setDrawerOpen(false);
                setDeleteTarget({
                  id: selectedAsset.id,
                  title: selectedAsset.title,
                });
              }
            : undefined
        }
      />

      {/* Delete Dialog */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title ?? ''}"?`}
        size="sm"
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        }
      >
        <Alert variant="error">
          This action cannot be undone. The item will be permanently removed
          from your vault.
        </Alert>
      </Modal>
    </div>
  );
}
