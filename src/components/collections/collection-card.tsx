'use client';

import { Folder, Pin, PinOff, Trash2, MoreHorizontal } from 'lucide-react';
import { getColorClasses } from '@/lib/colors';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { ActionMenu } from '@/components/ui/action-menu';
import { IconButton } from '@/components/ui/icon-button';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    color?: string | null;
    pinned: boolean;
    _count: { assets: number };
  };
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export function CollectionCard({
  collection,
  onClick,
  onTogglePin,
  onDelete,
}: CollectionCardProps) {
  const colorClasses = getColorClasses(collection.color);

  const menuItems = [
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

  return (
    <Card hoverable onClick={onClick} className="group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <IconBadge icon={Folder} variant="collection" color={colorClasses} size="md" />
        <ActionMenu
          items={menuItems}
          trigger={
            <IconButton
              icon={MoreHorizontal}
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all"
              onClick={e => e.stopPropagation()}
              label="More actions"
            />
          }
        />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-200 truncate">{collection.name}</p>
        <p className="text-[10px] text-outline mt-0.5">{collection._count.assets} items</p>
      </div>
    </Card>
  );
}
