import { Search } from 'lucide-react';
import { Kbd } from '@cellar/ui';
import { useCommandPalette } from '@/hooks/use-command-palette';

export function CommandTrigger() {
  const { setOpen } = useCommandPalette();

  return (
    <>
      {/* Desktop: full-width search-style trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="hidden md:flex relative items-center w-full max-w-[260px] h-8 rounded-md border border-outline bg-surface-container-high px-3 gap-2 text-xs text-on-surface-faint hover:text-on-surface-variant transition-colors"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">Search assets, collections…</span>
        <Kbd>⌘K</Kbd>
      </button>

      {/* Mobile: magnifier icon only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </>
  );
}
