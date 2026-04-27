import { Pin, PinOff, Trash2, MoreVertical } from 'lucide-react';
import { AssetType } from '@cellar/shared';
import { TYPE_CONFIG } from '@/lib/asset-types';
import { cn } from '@/lib/utils';
import { IconBadgeProps } from '@/components/ui/icon-badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { ActionMenu } from '@/components/ui/action-menu';
import { IconButton } from '@/components/ui/icon-button';

interface AssetCardProps {
  asset: {
    id: string;
    type: AssetType;
    title: string;
    language?: string | null;
    pinned: boolean;
    updatedAt: Date;
  };
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export function AssetCard({
  asset,
  onClick,
  onTogglePin,
  onDelete,
  compact = false,
}: AssetCardProps) {
  const config = TYPE_CONFIG[asset.type];
  const subtitle =
    asset.type === 'SNIPPET' && asset.language
      ? `${config.label} • ${asset.language}`
      : config.label;

  const menuItems = [
    {
      id: 'pin',
      label: asset.pinned ? 'Unpin' : 'Pin',
      icon: asset.pinned ? PinOff : Pin,
      onClick: onTogglePin,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'danger' as const,
      onClick: onDelete,
    },
  ];

  if (compact) {
    return (
      <Card
        hoverable
        onClick={onClick}
        padding="sm"
        className={cn(
          'flex items-center gap-3 hover:bg-surface-container group cursor-pointer',
          asset.pinned && '!border-l-2 !border-l-primary bg-primary/5'
        )}
      >
        <IconBadge
          icon={config.icon}
          variant={asset.type.toLowerCase() as IconBadgeProps['variant']}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{asset.title}</p>
          <p className="text-[10px] text-outline truncate">{subtitle}</p>
        </div>
      </Card>
    );
  }

  const actionMenu = (
    <div onClick={e => e.stopPropagation()}>
      <ActionMenu
        items={menuItems}
        trigger={
          <IconButton
            icon={MoreVertical}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            label="More actions"
          />
        }
      />
    </div>
  );

  return (
    <Card
      hoverable
      onClick={onClick}
      padding="sm"
      className={cn(
        'flex items-center gap-4 hover:bg-surface-container-high group cursor-pointer',
        asset.pinned && '!border-l-2 !border-l-primary bg-primary/5'
      )}
    >
      <IconBadge
        icon={config.icon}
        variant={asset.type.toLowerCase() as IconBadgeProps['variant']}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-200 truncate">{asset.title}</h4>
        <p className="text-[10px] text-outline font-mono truncate">{subtitle}</p>
      </div>
      {actionMenu}
    </Card>
  );
}
