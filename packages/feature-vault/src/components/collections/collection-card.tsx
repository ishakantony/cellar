import { Folder, Pin, PinOff, Trash2, MoreHorizontal, Pencil } from 'lucide-react';
import { ActionMenu, IconButton, cn } from '@cellar/ui';

const DEFAULT_COLOR = '#3b82f6';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    pinned: boolean;
    _count: { assets: number };
  };
  layout?: 'grid' | 'list';
  onClick: () => void;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CollectionCard({
  collection,
  layout = 'grid',
  onClick,
  onTogglePin,
  onEdit,
  onDelete,
}: CollectionCardProps) {
  const color = collection.color || DEFAULT_COLOR;

  const menuItems = [
    { id: 'edit', label: 'Edit', icon: Pencil, onClick: onEdit },
    {
      id: 'pin',
      label: collection.pinned ? 'Unpin' : 'Pin',
      icon: collection.pinned ? PinOff : Pin,
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

  const actionMenu = (
    <div onClick={e => e.stopPropagation()}>
      <ActionMenu
        items={menuItems}
        trigger={
          <IconButton
            icon={MoreHorizontal}
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-all"
            label="More actions"
          />
        }
      />
    </div>
  );

  const pinIcon = collection.pinned ? (
    <Pin className="h-3 w-3 shrink-0 text-vault-accent" aria-label="Pinned" />
  ) : null;

  const folderTile = (
    <span
      className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md')}
      style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}
    >
      <Folder className="h-4 w-4" style={{ color }} />
    </span>
  );

  if (layout === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          'group flex items-center gap-2.5 rounded-md px-3 py-2.5 cursor-pointer',
          'border border-outline-variant bg-surface-container-high',
          'hover:bg-surface-container-highest hover:border-outline transition-colors'
        )}
      >
        {folderTile}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            {pinIcon}
            <p className="truncate text-xs font-semibold text-foreground">{collection.name}</p>
          </div>
          {collection.description && (
            <p className="truncate text-[10px] text-on-surface-faint mt-0.5">
              {collection.description}
            </p>
          )}
        </div>
        <span className="shrink-0 font-mono text-[10px] text-on-surface-faint">
          {collection._count.assets} items
        </span>
        {actionMenu}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group flex flex-col gap-3 rounded-lg p-3.5 cursor-pointer',
        'border border-outline-variant bg-surface-container-high',
        'hover:bg-surface-container-highest hover:border-outline transition-colors'
      )}
    >
      <div className="flex items-center justify-between">
        {folderTile}
        {actionMenu}
      </div>
      <div>
        <div className="flex items-center gap-1">
          {pinIcon}
          <p className="truncate text-xs font-semibold text-foreground">{collection.name}</p>
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-on-surface-faint">
          {collection._count.assets} items
        </p>
      </div>
    </div>
  );
}
