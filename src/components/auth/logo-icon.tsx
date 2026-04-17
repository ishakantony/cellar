import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LogoIconProps {
  className?: string;
}

export function LogoIcon({ className }: LogoIconProps) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container',
        className
      )}
    >
      <Package className="h-5 w-5" />
    </div>
  );
}
