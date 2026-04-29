import { LogOut } from 'lucide-react';
import { Avatar, cn } from '@cellar/ui';
export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  className?: string;
}

export function UserMenu({ user, onSignOut, className }: UserMenuProps) {
  return (
    <div
      className={cn('flex items-center gap-3 px-4 py-3 bg-surface-container rounded-lg', className)}
    >
      <Avatar src={user.image} name={user.name} size="sm" />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-xs font-bold text-slate-100">{user.name}</p>
      </div>
      <button
        onClick={onSignOut}
        className="text-slate-400 hover:text-error transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
