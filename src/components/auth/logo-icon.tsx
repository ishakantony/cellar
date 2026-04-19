import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface LogoIconProps {
  className?: string;
}

// Alias for backward compatibility
export const Logo = LogoIcon;

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <div className={cn('flex h-10 w-10 items-center justify-center', className)}>
      <Image src="/logo.svg" alt="Logo" width={200} height={200} />
    </div>
  );
}
