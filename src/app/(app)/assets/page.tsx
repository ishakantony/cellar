import { AssetType } from '@/generated/prisma/enums';
import { getAssets } from '@/app/actions/assets';
import { AssetsClient } from './assets-client';
import { Suspense } from 'react';

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const VALID_ASSET_TYPES = ['SNIPPET', 'PROMPT', 'NOTE', 'LINK', 'IMAGE', 'FILE'] as const;
  const VALID_SORT = ['newest', 'oldest', 'az', 'za'] as const;

  const rawType = params.type;
  const type = (VALID_ASSET_TYPES as readonly string[]).includes(rawType ?? '')
    ? (rawType as AssetType)
    : null;
  const sort = (VALID_SORT as readonly string[]).includes(params.sort ?? '')
    ? (params.sort as (typeof VALID_SORT)[number])
    : 'newest';
  const q = params.q || '';

  const assets = await getAssets({
    type: type ?? undefined,
    sort: sort as 'newest' | 'oldest' | 'az' | 'za',
    q: q || undefined,
  });

  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-outline">Loading...</div>}>
      <AssetsClient assets={assets} currentType={type} currentSort={sort} searchQuery={q} />
    </Suspense>
  );
}
