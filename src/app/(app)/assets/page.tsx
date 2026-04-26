import { AssetsClient } from './assets-client';
import { getAssets } from '@/app/actions/assets';
import { Suspense } from 'react';

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; sort?: string }>;
}) {
  const { q, type, sort } = await searchParams;

  const initialAssets = await getAssets({
    q: q || undefined,
    type: (type as never) || undefined,
    sort: (sort as 'newest' | 'oldest' | 'az' | 'za') || undefined,
    limit: 20,
    offset: 0,
  });

  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-outline">Loading...</div>}>
      <AssetsClient initialAssets={initialAssets} initialHasMore={initialAssets.length === 20} />
    </Suspense>
  );
}
