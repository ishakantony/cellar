export interface AssetCardSkeletonProps {
  compact?: boolean;
}

export function AssetCardSkeleton({ compact = false }: AssetCardSkeletonProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface-container px-3 py-2.5 animate-pulse">
        <div className="h-8 w-8 rounded-lg bg-surface-container-high flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-3.5 w-3/4 rounded bg-surface-container-high" />
          <div className="h-2.5 w-1/2 rounded bg-surface-container-high" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface-container px-3 py-3 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-surface-container-high flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-4 w-2/3 rounded bg-surface-container-high" />
        <div className="h-2.5 w-1/3 rounded bg-surface-container-high" />
      </div>
      <div className="h-8 w-8 rounded-lg bg-surface-container-high flex-shrink-0" />
    </div>
  );
}
