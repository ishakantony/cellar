import { redirect } from 'next/navigation';
import { getAsset } from '@/app/actions/assets';
import { getCollections } from '@/app/actions/collections';
import { AssetDetailClient } from './asset-detail-client';

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAsset(id);

  if (!asset) {
    redirect('/assets');
  }

  const collections = await getCollections();

  return (
    <AssetDetailClient
      asset={asset}
      availableCollections={collections.map(c => ({ id: c.id, name: c.name }))}
    />
  );
}
