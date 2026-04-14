"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionCard } from "@/components/collection-card";
import { CollectionModal } from "@/components/collection-modal";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  createCollection,
  toggleCollectionPin,
  deleteCollection,
} from "@/app/actions/collections";

type CollectionItem = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  pinned: boolean;
  _count: { assets: number };
};

export function CollectionsClient({
  collections,
}: {
  collections: CollectionItem[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteCollection(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Collections
          </h2>
          <p className="text-xs text-outline mt-1">
            {collections.length} collection
            {collections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container/20 hover:bg-primary-container/40 border border-primary/20 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
        >
          New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onClick={() => router.push(`/collections/${collection.id}`)}
            onTogglePin={async () => {
              await toggleCollectionPin(collection.id);
              router.refresh();
            }}
            onDelete={() =>
              setDeleteTarget({ id: collection.id, name: collection.name })
            }
          />
        ))}
      </div>

      {collections.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-xs text-outline">
            No collections yet. Create one to organize your assets.
          </p>
        </div>
      )}

      <CollectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => {
          await createCollection(data);
          router.refresh();
        }}
      />

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.name ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
