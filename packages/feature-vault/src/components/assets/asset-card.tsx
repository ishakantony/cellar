import { Pin, PinOff, Trash2, MoreVertical } from 'lucide-react';
import { AssetType } from '@cellar/shared';
import { TYPE_CONFIG } from '../../lib/asset-types';
import { useAssetDrawer } from '../../hooks/use-asset-drawer';
import { ActionMenu, IconButton, TypeBadge, cn } from '@cellar/ui';

interface AssetCardProps {
  asset: {
    id: string;
    type: AssetType;
    title: string;
    language?: string | null;
    pinned: boolean;
    updatedAt: Date;
  };
  onTogglePin: () => void;
  onDelete: () => void;
  compact?: boolean;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function AssetCard({ asset, onTogglePin, onDelete, compact = false }: AssetCardProps) {
  const { openView } = useAssetDrawer();
  const config = TYPE_CONFIG[asset.type];
  const Icon = config.icon;
  const subtitle =
    asset.type === 'SNIPPET' && asset.language
      ? `${config.label} • ${asset.language}`
      : config.label;
  const updated = formatRelativeTime(asset.updatedAt);

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
      <button
        type="button"
        onClick={() => openView(asset.id)}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left',
          'border border-outline-variant bg-surface-container-high hover:bg-surface-container-highest hover:border-outline',
          'transition-colors cursor-pointer'
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.5 rounded-l-lg opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: config.color }}
        />
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="flex w-full items-center gap-1">
            {asset.pinned && (
              <Pin className="h-3 w-3 shrink-0 text-vault-accent" aria-label="Pinned" />
            )}
            <span className="truncate text-xs font-semibold text-foreground">{asset.title}</span>
          </span>
          <span className="truncate text-[10px] font-mono text-on-surface-faint">{subtitle}</span>
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <TypeBadge label={config.label.toLowerCase()} color={config.color} />
          <span className="font-mono text-[10px] text-on-surface-faint">{updated}</span>
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={() => openView(asset.id)}
      className={cn(
        'group relative flex items-center gap-4 rounded-lg px-4 py-3',
        'border border-outline-variant bg-surface-container-high hover:bg-surface-container-highest hover:border-outline',
        'transition-colors cursor-pointer'
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 rounded-l-lg opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: config.color }}
      />
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ background: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          {asset.pinned && (
            <Pin className="h-3 w-3 shrink-0 text-vault-accent" aria-label="Pinned" />
          )}
          <h4 className="truncate text-sm font-semibold text-foreground">{asset.title}</h4>
        </div>
        <p className="mt-0.5 truncate text-[10px] font-mono text-on-surface-faint">{subtitle}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <TypeBadge label={config.label.toLowerCase()} color={config.color} />
        <span className="font-mono text-[10px] text-on-surface-faint">{updated}</span>
      </div>
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
    </div>
  );
}
