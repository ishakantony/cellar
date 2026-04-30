import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Avatar, Button, cn, useClickOutside } from '@cellar/ui';

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  onNavigateSettings: () => void;
  className?: string;
}

export function UserMenu({ user, onSignOut, onNavigateSettings, className }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className="flex items-center rounded-full ring-offset-2 ring-offset-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Avatar src={user.image} name={user.name} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-lg border border-white/10 bg-surface-container-high py-1 shadow-xl z-50"
        >
          <div className="px-3 py-2">
            <p className="truncate text-xs font-bold text-slate-100">{user.name}</p>
            <p className="truncate text-[11px] text-outline">{user.email}</p>
          </div>
          <div className="my-1 border-t border-white/10" />
          <Button
            role="menuitem"
            variant="ghost"
            onClick={() => {
              setOpen(false);
              onNavigateSettings();
            }}
            className="w-full justify-start gap-2 px-3 py-2 text-xs normal-case tracking-normal font-normal text-on-surface-variant hover:text-on-surface-variant"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            Settings
          </Button>
          <div className="my-1 border-t border-white/10" />
          <Button
            role="menuitem"
            variant="ghost"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="w-full justify-start gap-2 px-3 py-2 text-xs normal-case tracking-normal font-normal text-error hover:text-error hover:bg-error/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
}
