'use client';

import { Clock } from 'lucide-react';

export function CollectionDetailClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-surface-container mb-6">
        <Clock className="h-8 w-8 text-outline" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-2">Coming Soon</h1>
      <p className="text-sm text-outline max-w-sm">
        Collection details are under construction. Check back later for updates.
      </p>
    </div>
  );
}
