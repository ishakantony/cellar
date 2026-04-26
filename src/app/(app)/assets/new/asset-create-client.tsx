'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAsset } from '@/app/actions/assets';
import { addAssetToCollection } from '@/app/actions/collections';
import { AssetForm } from '@/components/assets/asset-form';
import type { CreateAssetInput } from '@/lib/validation';

export interface AssetCreateClientProps {
  availableCollections: { id: string; name: string }[];
}

export function AssetCreateClient({ availableCollections }: AssetCreateClientProps) {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: CreateAssetInput & { collectionIds?: string[] }) => {
      const { collectionIds, ...assetData } = data;
      const asset = await createAsset(assetData);

      if (collectionIds && collectionIds.length > 0) {
        await Promise.all(collectionIds.map(id => addAssetToCollection(asset.id, id)));
      }

      toast.success(`Asset "${asset.title}" created`);
      router.push(`/assets/${asset.id}`);
    },
    [router]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-100">New Asset</h1>
        <p className="text-xs text-outline mt-1">Add a new item to your vault</p>
      </div>
      <AssetForm
        mode="create"
        availableCollections={availableCollections}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/assets')}
      />
    </div>
  );
}
