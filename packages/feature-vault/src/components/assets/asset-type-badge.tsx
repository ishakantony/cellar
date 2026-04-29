import { AssetType } from '@cellar/shared';
import { TYPE_CONFIG } from '../../lib/asset-types';

export interface AssetTypeBadgeProps {
  type: AssetType;
  showLabel?: boolean;
}

export function AssetTypeBadge({ type, showLabel = false }: AssetTypeBadgeProps) {
  const config = TYPE_CONFIG[type];

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${config.badge}`}
    >
      {showLabel ? config.label : type}
    </span>
  );
}
