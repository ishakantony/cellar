import { Logo } from '@/components/auth/logo-icon';
import { cn } from '@/lib/utils';

export interface SidebarLogoProps {
  className?: string;
}

export function SidebarLogo({ className }: SidebarLogoProps) {
  return (
    <div className={cn('px-6', className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Logo className="h-4 w-4" />
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-100">Cellar</h1>
      </div>
    </div>
  );
}
