import { cn } from '@cellar/ui';

export interface LogoIconProps {
  className?: string;
}

export const Logo = LogoIcon;

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <div className={cn('flex h-10 w-10 items-center justify-center', className)}>
      <img src="/logo.svg" alt="Logo" width={200} height={200} />
    </div>
  );
}
