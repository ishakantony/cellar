import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function TextLink({ href, children, className }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn('text-primary hover:text-primary-dim transition-colors', className)}
    >
      {children}
    </Link>
  );
}
