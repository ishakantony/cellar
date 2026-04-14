"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssetCard } from "@/components/asset-card";
import { AssetDrawer } from "@/components/asset-drawer";
import { DeleteDialog } from "@/components/delete-dialog";
import { togglePin, deleteAsset, getAsset } from "@/app/actions/assets";
import { AssetType } from "@/generated/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  assets: { asset: AssetItem }[];
  _count: { assets: number };
};

export function CollectionDetailClient({
  collection,
}: {
  collection: CollectionDetail;
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  async function handleAssetClick(asset: AssetItem) {
    const full = await getAsset(asset.id);
    if (full) {
      setSelectedAsset(full as AssetItem);
      setDrawerOpen(true);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteAsset(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  const assets = collection.assets.map((ac) => ac.asset);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/collections"
          className="flex items-center gap-1 text-xs text-outline hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Collections
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="text-xs text-outline mt-1">
            {collection.description}
          </p>
        )}
        <p className="text-xs text-outline mt-1">
          {collection._count.assets} item
          {collection._count.assets !== 1 ? "s" : ""}
        </p>
      </div>

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
              This collection is empty.
            </p>
          </div>
        )}
      </div>

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

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
