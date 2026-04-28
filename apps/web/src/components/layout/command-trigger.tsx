import { Search } from 'lucide-react';
import { useCommandPalette } from '@/hooks/use-command-palette';

export function CommandTrigger() {
  const { setOpen } = useCommandPalette();

  return (
    <>
      {/* Desktop: wide search pill with ⌘K badge */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="hidden md:flex items-center gap-2 h-8 px-3 rounded-full bg-white/5 border border-white/10 text-sm text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors w-full max-w-xs"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">Search or run a command…</span>
        <kbd className="shrink-0 inline-flex items-center gap-0.5 rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[10px] font-medium text-white/30">
          ⌘K
        </kbd>
      </button>

      {/* Mobile: magnifier icon only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="md:hidden flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </>
  );
}
