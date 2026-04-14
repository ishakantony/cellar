"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssetType } from "@/generated/prisma";
import { QuickActions } from "@/components/quick-actions";
import { AssetCard } from "@/components/asset-card";
import { CollectionCard } from "@/components/collection-card";
import { AssetDrawer } from "@/components/asset-drawer";
import { DeleteDialog } from "@/components/delete-dialog";
import { togglePin, deleteAsset, getAsset } from "@/app/actions/assets";
import { toggleCollectionPin, deleteCollection } from "@/app/actions/collections";
import { Pin, FolderOpen, Clock } from "lucide-react";

type DashboardAsset = {
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

type DashboardCollection = {
  id: string;
  name: string;
  color: string | null;
  pinned: boolean;
  _count: { assets: number };
};

export function DashboardClient({
  pinnedAssets,
  pinnedCollections,
  recentAssets,
}: {
  pinnedAssets: DashboardAsset[];
  pinnedCollections: DashboardCollection[];
  recentAssets: DashboardAsset[];
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [selectedAsset, setSelectedAsset] = useState<DashboardAsset | null>(
    null
  );
  const [defaultType, setDefaultType] = useState<AssetType>("SNIPPET");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "asset" | "collection";
    id: string;
    title: string;
  } | null>(null);

  async function handleAssetClick(asset: DashboardAsset) {
    const full = await getAsset(asset.id);
    if (full) {
      setSelectedAsset(full as DashboardAsset);
      setDrawerMode("view");
      setDrawerOpen(true);
    }
  }

  function handleQuickAction(type: AssetType) {
    setSelectedAsset(null);
    setDefaultType(type);
    setDrawerMode("create");
    setDrawerOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "asset") {
      await deleteAsset(deleteTarget.id);
    } else {
      await deleteCollection(deleteTarget.id);
    }
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-12">
      {/* Quick Actions */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Quick Actions
          </h2>
          <p className="text-xs text-outline">
            Instant access to creation tools.
          </p>
        </div>
        <QuickActions onAction={handleQuickAction} />
      </section>

      {/* Pinned Assets */}
      {pinnedAssets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">
                Pinned Assets
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            {pinnedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => handleAssetClick(asset)}
                onTogglePin={async () => {
                  await togglePin(asset.id);
                  router.refresh();
                }}
                onDelete={() =>
                  setDeleteTarget({
                    type: "asset",
                    id: asset.id,
                    title: asset.title,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Pinned Collections */}
      {pinnedCollections.length > 0 && (
        <section className="!mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">
                Pinned Collections
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pinnedCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() =>
                  router.push(`/collections/${collection.id}`)
                }
                onTogglePin={async () => {
                  await toggleCollectionPin(collection.id);
                  router.refresh();
                }}
                onDelete={() =>
                  setDeleteTarget({
                    type: "collection",
                    id: collection.id,
                    title: collection.name,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Assets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-outline" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">
              Recent Assets
            </h3>
          </div>
        </div>
        <div className="space-y-1">
          {recentAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              compact
              onClick={() => handleAssetClick(asset)}
              onTogglePin={async () => {
                await togglePin(asset.id);
                router.refresh();
              }}
              onDelete={() =>
                setDeleteTarget({
                  type: "asset",
                  id: asset.id,
                  title: asset.title,
                })
              }
            />
          ))}
          {recentAssets.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-outline">
                No assets yet. Create one above!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Drawer */}
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        asset={selectedAsset}
        mode={drawerMode}
        defaultType={defaultType}
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
        onDelete={
          selectedAsset
            ? () => {
                setDrawerOpen(false);
                setDeleteTarget({
                  type: "asset",
                  id: selectedAsset.id,
                  title: selectedAsset.title,
                });
              }
            : undefined
        }
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
