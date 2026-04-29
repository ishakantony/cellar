import { Search } from 'lucide-react';
import { useCommandPalette } from '@/hooks/use-command-palette';

export function CommandTrigger() {
  const { setOpen } = useCommandPalette();

  return (
    <>
      {/* Desktop: search input style matching /collections SearchInput */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="hidden md:flex relative items-center w-full max-w-sm rounded-lg bg-surface-container pl-9 pr-14 py-2.5 text-sm text-outline/50 hover:bg-surface-container-high transition-colors"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none" />
        <span className="flex-1 text-left truncate">Search or run a command…</span>
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[10px] font-medium text-outline/60">
          ⌘K
        </kbd>
      </button>

      {/* Mobile: magnifier icon only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-surface-container text-outline hover:bg-surface-container-high transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </>
  );
}
