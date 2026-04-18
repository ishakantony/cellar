import { AssetsClient } from './assets-client';
import { Suspense } from 'react';

export default async function AssetsPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-outline">Loading...</div>}>
      <AssetsClient />
    </Suspense>
  );
}
