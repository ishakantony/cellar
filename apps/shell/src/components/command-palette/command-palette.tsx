import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import { useNavigate, useLocation } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { registry } from '@/shell/feature-registry';
import { resolvedEntries } from '@/shell/feature-registry';
import { shellStaticCommands } from '@/shell/shell-static-commands';
import { filterCommandsByScope } from '@/shell/filter-commands-by-scope';
import { cn } from '@cellar/ui';
import type { PaletteCommand, PaletteItem, PaletteConnectorProps } from '@cellar/shell-contract';
import type { ComponentType } from 'react';

// ---------------------------------------------------------------------------
// Group types
// ---------------------------------------------------------------------------

interface ItemGroup {
  id: string;
  label: string;
  items: PaletteItem[];
  status: 'ok' | 'loading' | 'error';
}

type ConnectorResult = { items: PaletteItem[]; isPending: boolean; isError: boolean };

interface NamedConnector {
  id: string;
  Connector: ComponentType<PaletteConnectorProps>;
}

// ---------------------------------------------------------------------------
// CommandPalette
// ---------------------------------------------------------------------------

export function CommandPalette() {
  const { open, query, setOpen, setQuery } = useCommandPalette();
  const navigate = useNavigate();
  const location = useLocation();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Snapshot the element that had focus before the palette opened so we can
  // return focus to it on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLButtonElement | null;
    }
  }, [open]);

  // Debounce non-empty queries to avoid issuing a search on every keystroke.
  // Immediately clear when the user erases input so recents snap back.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      return;
    }
    const id = setTimeout(() => setDebouncedQuery(trimmed), 150);
    return () => clearTimeout(id);
  }, [query]);

  // Connector result state — updated by each feature's PaletteConnector
  const [connectorResults, setConnectorResults] = useState<Map<string, ConnectorResult>>(new Map());

  const updateResults = useCallback((id: string, result: ConnectorResult) => {
    setConnectorResults(prev => new Map(prev).set(id, result));
  }, []);

  // Clear stale results when the palette closes so it starts clean on reopen
  useEffect(() => {
    if (!open) setConnectorResults(new Map());
  }, [open]);

  // Collect connector components from eagerly-loaded feature modules (stable)
  const connectors = useMemo(
    (): NamedConnector[] =>
      resolvedEntries
        .filter(({ module }) => module.PaletteConnector != null)
        .map(({ entry, module }) => ({
          id: entry.manifest.id,
          Connector: module.PaletteConnector!,
        })),
    []
  );

  // Collect static commands from shell and all feature manifests
  const allStaticCommands = useMemo(() => {
    const featureCommands = registry.list().flatMap(entry => entry.manifest.staticCommands ?? []);
    return [...shellStaticCommands, ...featureCommands];
  }, []);

  // Determine active feature by checking which manifest's basePath is a prefix
  // of the current location.
  const activeFeatureId = useMemo(() => {
    const entries = registry.list();
    const sorted = [...entries].sort(
      (a, b) => b.manifest.basePath.length - a.manifest.basePath.length
    );
    const match = sorted.find(e => location.pathname.startsWith(e.manifest.basePath));
    return match?.manifest.id ?? null;
  }, [location.pathname]);

  const handleClose = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [setOpen]);

  const handleSelectItem = useCallback(
    (item: PaletteItem) => {
      handleClose();
      if (item.action) {
        void item.action();
      } else if (item.href) {
        navigate(item.href);
      }
    },
    [handleClose, navigate]
  );

  const handleSelectCommand = useCallback(
    (cmd: PaletteCommand) => {
      handleClose();
      if (cmd.kind === 'navigate' && cmd.href) {
        navigate(cmd.href);
      } else if (cmd.kind === 'action' && cmd.action) {
        void cmd.action();
      }
    },
    [handleClose, navigate]
  );

  // Build item groups from connector results
  const itemGroups = useMemo((): ItemGroup[] => {
    return connectors
      .map(({ id }) => {
        const r = connectorResults.get(id);
        const label = registry.list().find(e => e.manifest.id === id)?.manifest.label ?? id;
        if (!r) return { id, label, items: [], status: 'loading' as const };
        return {
          id,
          label,
          items: r.items,
          status: r.isPending
            ? ('loading' as const)
            : r.isError
              ? ('error' as const)
              : ('ok' as const),
        };
      })
      .filter(g => g.items.length > 0 || g.status === 'error');
  }, [connectors, connectorResults]);

  // Recents are the connector items when query is empty
  const recentItems = useMemo(
    () => connectors.flatMap(({ id }) => connectorResults.get(id)?.items ?? []),
    [connectors, connectorResults]
  );

  // Categorize static commands for display
  const { navCommands, actionCommands } = useMemo(() => {
    const nav: PaletteCommand[] = [];
    const actions: PaletteCommand[] = [];

    const trimmed = query.trim().toLowerCase();
    const scopeFiltered = filterCommandsByScope(allStaticCommands, activeFeatureId);

    for (const cmd of scopeFiltered) {
      const matchesSearch =
        !trimmed ||
        cmd.label.toLowerCase().includes(trimmed) ||
        (cmd.href ?? '').toLowerCase().includes(trimmed);

      if (!matchesSearch) continue;

      if (cmd.kind === 'navigate') {
        nav.push(cmd);
      } else {
        actions.push(cmd);
      }
    }

    return { navCommands: nav, actionCommands: actions };
  }, [allStaticCommands, activeFeatureId, query]);

  // Sort item groups: active feature first, then alphabetically
  const sortedItemGroups = useMemo(() => {
    return [...itemGroups].sort((a, b) => {
      if (a.id === activeFeatureId) return -1;
      if (b.id === activeFeatureId) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [itemGroups, activeFeatureId]);

  const isSearching =
    debouncedQuery.length > 0 &&
    connectors.some(({ id }) => {
      const r = connectorResults.get(id);
      return !r || r.isPending;
    });

  const hasNoResults =
    query.trim().length > 0 &&
    sortedItemGroups.every(g => g.items.length === 0 && g.status === 'ok') &&
    navCommands.length === 0 &&
    actionCommands.length === 0;

  const showRecents = !query.trim() && recentItems.length > 0;

  return (
    <>
      {/* Connector components — render null, push results to connectorResults */}
      {open &&
        connectors.map(({ id, Connector }) => (
          <Connector
            key={id}
            query={debouncedQuery}
            onResults={result => updateResults(id, result)}
          />
        ))}

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
              'fixed z-50 left-1/2 -translate-x-1/2',
              'w-[calc(100vw-2rem)] max-w-[640px]',
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
              {/* Search input */}
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
                {isSearching ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-sm text-white/30">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching…
                  </div>
                ) : hasNoResults ? (
                  <Command.Empty className="py-8 text-center text-sm text-white/30">
                    No results found.
                  </Command.Empty>
                ) : (
                  <>
                    {/* Dynamic provider results (non-empty query) */}
                    {sortedItemGroups
                      .filter(g => g.items.length > 0 || g.status === 'error')
                      .map(group => (
                        <ItemGroupSection
                          key={group.id}
                          group={group}
                          onSelect={handleSelectItem}
                        />
                      ))}

                    {/* Recents (empty query) */}
                    {showRecents && (
                      <CommandGroupSection
                        id="recent"
                        label="Recent"
                        items={recentItems}
                        onSelectItem={handleSelectItem}
                      />
                    )}

                    {/* Go To commands (nav kind, from manifests) */}
                    {navCommands.length > 0 && (
                      <StaticCommandGroupSection
                        id="goto"
                        label="Go To"
                        commands={navCommands}
                        onSelect={handleSelectCommand}
                      />
                    )}

                    {/* Quick Actions (action kind, from manifests) — shown for both empty and non-empty query */}
                    {actionCommands.length > 0 && (
                      <StaticCommandGroupSection
                        id="actions"
                        label="Quick Actions"
                        commands={actionCommands}
                        onSelect={handleSelectCommand}
                      />
                    )}
                  </>
                )}
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
    </>
  );
}

// ---------------------------------------------------------------------------
// ItemGroupSection — a provider's dynamic results
// ---------------------------------------------------------------------------

const GROUP_HEADING_CLASS = cn(
  '[&>[cmdk-group-heading]]:px-2',
  '[&>[cmdk-group-heading]]:py-1.5',
  '[&>[cmdk-group-heading]]:text-[11px]',
  '[&>[cmdk-group-heading]]:font-medium',
  '[&>[cmdk-group-heading]]:text-white/30',
  '[&>[cmdk-group-heading]]:uppercase',
  '[&>[cmdk-group-heading]]:tracking-wider'
);

function ItemGroupSection({
  group,
  onSelect,
}: {
  group: ItemGroup;
  onSelect: (item: PaletteItem) => void;
}) {
  if (group.status === 'error') {
    return (
      <Command.Group heading={group.label} className={GROUP_HEADING_CLASS}>
        <div className="flex items-center gap-2 px-2 py-2 text-sm text-white/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load results.
        </div>
      </Command.Group>
    );
  }

  if (group.items.length === 0) return null;

  return (
    <Command.Group heading={group.label} className={GROUP_HEADING_CLASS}>
      {group.items.map(item => (
        <PaletteItemRow key={item.id} item={item} onSelect={onSelect} />
      ))}
    </Command.Group>
  );
}

// ---------------------------------------------------------------------------
// CommandGroupSection — PaletteItem list with a heading (used for recents)
// ---------------------------------------------------------------------------

function CommandGroupSection({
  id,
  label,
  items,
  onSelectItem,
}: {
  id: string;
  label: string;
  items: PaletteItem[];
  onSelectItem: (item: PaletteItem) => void;
}) {
  if (items.length === 0) return null;

  return (
    <Command.Group key={id} heading={label} className={GROUP_HEADING_CLASS}>
      {items.map(item => (
        <PaletteItemRow key={item.id} item={item} onSelect={onSelectItem} />
      ))}
    </Command.Group>
  );
}

// ---------------------------------------------------------------------------
// StaticCommandGroupSection — PaletteCommand list with a heading
// ---------------------------------------------------------------------------

function StaticCommandGroupSection({
  id,
  label,
  commands,
  onSelect,
}: {
  id: string;
  label: string;
  commands: PaletteCommand[];
  onSelect: (cmd: PaletteCommand) => void;
}) {
  if (commands.length === 0) return null;

  return (
    <Command.Group key={id} heading={label} className={GROUP_HEADING_CLASS}>
      {commands.map(cmd => (
        <Command.Item
          key={cmd.id}
          value={cmd.id}
          onSelect={() => onSelect(cmd)}
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer',
            'text-sm text-white/80 transition-colors select-none',
            'data-[selected=true]:bg-white/10 data-[selected=true]:text-white',
            'aria-selected:bg-white/10 aria-selected:text-white'
          )}
        >
          {cmd.icon && <cmd.icon className="h-4 w-4 shrink-0 text-white/40" />}
          <span className="flex-1 truncate">{cmd.label}</span>
        </Command.Item>
      ))}
    </Command.Group>
  );
}

// ---------------------------------------------------------------------------
// PaletteItemRow — a single dynamic result item
// ---------------------------------------------------------------------------

function PaletteItemRow({
  item,
  onSelect,
}: {
  item: PaletteItem;
  onSelect: (item: PaletteItem) => void;
}) {
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
      {item.icon && <item.icon className="h-4 w-4 shrink-0 text-white/40" />}
      {!item.icon && <Search className="h-4 w-4 shrink-0 text-white/40" />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.description && (
        <span className="text-[11px] text-white/25 shrink-0">{item.description}</span>
      )}
    </Command.Item>
  );
}
