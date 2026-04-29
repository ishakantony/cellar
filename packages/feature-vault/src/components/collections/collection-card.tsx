import { Folder, Pin, PinOff, Trash2, MoreHorizontal, Pencil } from 'lucide-react';
import { getColorClasses } from '../../lib/colors';
import { ActionMenu, Card, IconBadge, IconButton } from '@cellar/ui';
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
  const colorClasses = getColorClasses(collection.color);

  const menuItems = [
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: onEdit,
    },
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
    <Pin className="h-3 w-3 shrink-0 text-amber-400" aria-label="Pinned" />
  ) : null;

  if (layout === 'list') {
    return (
      <Card hoverable onClick={onClick} className="group cursor-pointer" padding="sm">
        <div className="flex items-center gap-3">
          <IconBadge icon={Folder} variant="collection" color={colorClasses} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {pinIcon}
              <p className="text-xs font-bold text-slate-200 truncate">{collection.name}</p>
            </div>
            {collection.description && (
              <p className="text-[10px] text-outline truncate">{collection.description}</p>
            )}
          </div>
          <p className="text-[10px] text-outline shrink-0">{collection._count.assets} items</p>
          {actionMenu}
        </div>
      </Card>
    );
  }

  return (
    <Card hoverable onClick={onClick} className="group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <IconBadge icon={Folder} variant="collection" color={colorClasses} size="md" />
        {actionMenu}
      </div>
      <div>
        <div className="flex items-center gap-1">
          {pinIcon}
          <p className="text-xs font-bold text-slate-200 truncate">{collection.name}</p>
        </div>
        <p className="text-[10px] text-outline mt-0.5">{collection._count.assets} items</p>
      </div>
    </Card>
  );
}
