import { TYPE_CONFIG } from '@/lib/asset-types';
import { AssetType } from '@/generated/prisma/enums';

export interface AssetIconProps {
  type: AssetType;
  className?: string;
}

export function AssetIcon({ type, className }: AssetIconProps) {
  const Icon = TYPE_CONFIG[type].icon;
  return <Icon className={className} />;
}
