import { getCollections } from '@/app/actions/collections';
import { AssetCreateClient } from './asset-create-client';

export default async function NewAssetPage() {
  const collections = await getCollections();

  return (
    <AssetCreateClient availableCollections={collections.map(c => ({ id: c.id, name: c.name }))} />
  );
}
