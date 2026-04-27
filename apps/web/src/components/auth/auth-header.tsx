import { LogoIcon } from './logo-icon';
import { cn } from '@cellar/ui';

export interface AuthHeaderProps {
  subtitle: string;
  className?: string;
}

export function AuthHeader({ subtitle, className }: AuthHeaderProps) {
  return (
    <div className={cn('mb-8 flex flex-col items-center gap-3', className)}>
      <LogoIcon />
      <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-100">Cellar</h1>
      <p className="text-xs text-outline">{subtitle}</p>
    </div>
  );
}
