import { useEffect, useCallback, useRef } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Search,
  Pin,
  Folder,
  LayoutDashboard,
  Package,
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  FileText,
  PlusCircle,
  FolderPlus,
  LogOut,
  PanelLeftClose,
} from 'lucide-react';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { useCollectionModal } from '@/hooks/use-collection-modal';
import { useAssetDrawer } from '@/hooks/use-asset-drawer';
import { useCommandPaletteData } from '@/hooks/use-command-palette-data';
import { allNavEntries } from '@/lib/nav-config';
import {
  commandPaletteResults,
  type PaletteItem,
  type PaletteGroup,
} from '@/lib/command-palette-results';
import { cn } from '@cellar/ui';
import type { AssetType } from '@cellar/shared';

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.round((then - now) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second');
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');
  return rtf.format(Math.round(diffDays / 365), 'year');
}

// ---------------------------------------------------------------------------
// Icon maps (module-level constants, never change)
// ---------------------------------------------------------------------------

const NAV_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '/dashboard': LayoutDashboard,
  '/assets': Package,
  '/collections': Folder,
  '/assets?type=SNIPPET': Code,
  '/assets?type=PROMPT': Terminal,
  '/assets?type=LINK': LinkIcon,
  '/assets?type=NOTE': StickyNote,
  '/assets?type=IMAGE': ImageIcon,
  '/assets?type=FILE': FileText,
};

const ACTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'new-snippet': Code,
  'new-prompt': Terminal,
  'new-link': LinkIcon,
  'new-note': StickyNote,
  'new-image': ImageIcon,
  'new-file': FileText,
  'new-collection': FolderPlus,
  'sign-out': LogOut,
  'toggle-sidebar': PanelLeftClose,
};

const ASSET_TYPE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  SNIPPET: Code,
  PROMPT: Terminal,
  LINK: LinkIcon,
  NOTE: StickyNote,
  IMAGE: ImageIcon,
  FILE: FileText,
};

// ---------------------------------------------------------------------------
// Asset type action map (module-level)
// ---------------------------------------------------------------------------

const ACTION_ASSET_TYPE: Record<string, AssetType> = {
  'new-snippet': 'SNIPPET',
  'new-prompt': 'PROMPT',
  'new-link': 'LINK',
  'new-note': 'NOTE',
  'new-image': 'IMAGE',
  'new-file': 'FILE',
};

// ---------------------------------------------------------------------------
// CommandPalette
// ---------------------------------------------------------------------------

export interface CommandPaletteProps {
  onToggleSidebar?: () => void;
}

export function CommandPalette({ onToggleSidebar }: CommandPaletteProps) {
  const { open, query, setOpen, setQuery } = useCommandPalette();
  const { openCreate: openCollectionCreate } = useCollectionModal();
  const { openView, openCreate: openAssetCreate } = useAssetDrawer();
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Fetch asset search results, recents, and collections
  const { searchAssets, searchAssetTotal, recentAssets, collections } =
    useCommandPaletteData(query);

  // Snapshot the element that had focus before the palette opened so we can
  // return focus to it on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLButtonElement | null;
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [setOpen]);

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      handleClose();

      switch (item.kind) {
        case 'nav':
          if (item.href) navigate(item.href);
          break;

        case 'collection':
          if (item.collection) navigate(`/collections/${item.collection.id}`);
          break;

        case 'asset':
          if (item.asset) openView(item.asset.id);
          break;

        case 'action': {
          const actionId = item.actionId ?? '';
          const assetType = ACTION_ASSET_TYPE[actionId];

          if (assetType) {
            openAssetCreate({ type: assetType });
          } else if (actionId === 'new-collection') {
            openCollectionCreate();
          } else if (actionId === 'sign-out') {
            import('@/lib/auth-client').then(({ signOut }) => {
              void signOut().then(() => navigate('/sign-in'));
            });
          } else if (actionId === 'toggle-sidebar') {
            onToggleSidebar?.();
          }
          break;
        }
      }
    },
    [handleClose, navigate, openView, openAssetCreate, openCollectionCreate, onToggleSidebar]
  );

  // Build result groups with live data
  const result = commandPaletteResults({
    query,
    recentAssets,
    searchAssets,
    searchAssetTotal,
    collections,
    navEntries: allNavEntries,
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        {/* Dimmed + blurred backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
          style={{ backdropFilter: 'blur(4px)' }}
        />

        {/* Palette container */}
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            // Positioning — desktop: ~15% from top, max 640 px wide, centered
            'fixed z-50 left-1/2 -translate-x-1/2',
            'w-[calc(100vw-2rem)] max-w-[640px]',
            // Mobile: full screen, input pinned to top
            'top-0 sm:top-[15vh]',
            'h-screen sm:h-auto sm:max-h-[70vh]',
            'rounded-none sm:rounded-xl',
            'overflow-hidden shadow-2xl',
            'bg-surface-container-high border-0 sm:border border-white/10',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
            'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]'
          )}
        >
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>

          <Command shouldFilter={false} className="flex flex-col h-full">
            {/* Search input — pinned to top on mobile */}
            <div className="flex items-center border-b border-white/10 px-3 shrink-0">
              <Search className="h-4 w-4 shrink-0 text-white/40 mr-2" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search or run a command…"
                className={cn(
                  'flex-1 h-12 bg-transparent text-sm text-white/90',
                  'placeholder:text-white/30 outline-none border-0'
                )}
                autoFocus
              />
            </div>

            {/* Result list */}
            <Command.List className="overflow-y-auto flex-1 p-2">
              <Command.Empty className="py-8 text-center text-sm text-white/30">
                No results found.
              </Command.Empty>

              {result.groups.map(group => (
                <PaletteGroupSection key={group.id} group={group} onSelect={handleSelect} />
              ))}
            </Command.List>

            {/* Keyboard hint footer */}
            <div className="shrink-0 border-t border-white/10 px-3 py-2 flex items-center gap-4 text-[11px] text-white/25">
              <span>
                <kbd className="rounded border border-white/10 px-1">↵</kbd> select
              </span>
              <span>
                <kbd className="rounded border border-white/10 px-1">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="rounded border border-white/10 px-1">esc</kbd> close
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// PaletteGroupSection
// ---------------------------------------------------------------------------

function PaletteGroupSection({
  group,
  onSelect,
}: {
  group: PaletteGroup;
  onSelect: (item: PaletteItem) => void;
}) {
  const headingContent =
    group.id === 'assets' && group.totalCount && group.totalCount > group.items.length ? (
      <span className="flex items-center gap-1.5">
        {group.label}
        <span className="rounded bg-white/10 px-1 py-0.5 text-[10px] font-medium text-white/40">
          {group.items.length} of {group.totalCount}
        </span>
      </span>
    ) : (
      group.label
    );

  return (
    <Command.Group
      heading={headingContent as string}
      className={cn(
        '[&>[cmdk-group-heading]]:px-2',
        '[&>[cmdk-group-heading]]:py-1.5',
        '[&>[cmdk-group-heading]]:text-[11px]',
        '[&>[cmdk-group-heading]]:font-medium',
        '[&>[cmdk-group-heading]]:text-white/30',
        '[&>[cmdk-group-heading]]:uppercase',
        '[&>[cmdk-group-heading]]:tracking-wider',
        '[&>[cmdk-group-heading]]:flex',
        '[&>[cmdk-group-heading]]:items-center'
      )}
    >
      {group.items.map(item => (
        <PaletteRow key={item.id} item={item} onSelect={onSelect} />
      ))}
    </Command.Group>
  );
}

// ---------------------------------------------------------------------------
// PaletteRow
// ---------------------------------------------------------------------------

function PaletteRow({
  item,
  onSelect,
}: {
  item: PaletteItem;
  onSelect: (item: PaletteItem) => void;
}) {
  const isAsset = item.kind === 'asset' && item.asset;
  return (
    <Command.Item
      value={item.id}
      onSelect={() => onSelect(item)}
      className={cn(
        'flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer',
        'text-sm text-white/80 transition-colors select-none',
        'data-[selected=true]:bg-white/10 data-[selected=true]:text-white',
        'aria-selected:bg-white/10 aria-selected:text-white'
      )}
    >
      <RowIcon item={item} />
      <span className="flex-1 truncate">{item.label}</span>
      {isAsset && (
        <span className="flex items-center gap-1.5 shrink-0">
          {item.asset!.pinned && <Pin className="h-3 w-3 text-white/30" />}
          <span className="text-[11px] text-white/25">{relativeTime(item.asset!.updatedAt)}</span>
        </span>
      )}
    </Command.Item>
  );
}

// ---------------------------------------------------------------------------
// RowIcon
// ---------------------------------------------------------------------------

function RowIcon({ item }: { item: PaletteItem }) {
  const iconClass = 'h-4 w-4 shrink-0 text-white/40';

  if (item.kind === 'asset' && item.asset) {
    const Icon = ASSET_TYPE_ICON_MAP[item.asset.type] ?? FileText;
    return <Icon className={iconClass} />;
  }

  if (item.kind === 'collection') {
    return <Folder className={iconClass} />;
  }

  if (item.kind === 'action' && item.actionId) {
    const Icon = ACTION_ICON_MAP[item.actionId] ?? PlusCircle;
    return <Icon className={iconClass} />;
  }

  if (item.kind === 'nav' && item.href) {
    const Icon = NAV_ICON_MAP[item.href] ?? Package;
    return <Icon className={iconClass} />;
  }

  return <Search className={iconClass} />;
}
