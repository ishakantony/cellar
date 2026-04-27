import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { CreateAssetInput } from '@cellar/shared';
import { AssetForm } from '@/components/assets/asset-form';
import { useCreateAssetMutation } from '@/hooks/mutations/use-asset-mutations';
import { useAddAssetToCollectionMutation } from '@/hooks/mutations/use-collection-mutations';
import { useCollectionsQuery } from '@/hooks/queries/use-collections';

export function AssetCreatePage() {
  const navigate = useNavigate();
  const createAsset = useCreateAssetMutation();
  const addToCollection = useAddAssetToCollectionMutation();
  const collectionsQuery = useCollectionsQuery();

  const availableCollections = collectionsQuery.data?.map(c => ({ id: c.id, name: c.name })) ?? [];

  const handleSubmit = useCallback(
    async (data: CreateAssetInput & { collectionIds?: string[] }) => {
      const { collectionIds, ...assetData } = data;
      const asset = await createAsset.mutateAsync(assetData);

      if (collectionIds && collectionIds.length > 0) {
        await Promise.all(
          collectionIds.map(collectionId =>
            addToCollection.mutateAsync({ collectionId, assetId: asset.id })
          )
        );
      }

      toast.success(`Asset "${asset.title}" created`);
      navigate(`/assets/${asset.id}`);
    },
    [createAsset, addToCollection, navigate]
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
        onCancel={() => navigate('/assets')}
      />
    </div>
  );
}
