import { Link } from 'react-router';
import { cn } from '../lib/cn';

export interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function TextLink({ href, children, className }: TextLinkProps) {
  return (
    <Link
      to={href}
      className={cn('text-primary hover:text-primary-dim transition-colors', className)}
    >
      {children}
    </Link>
  );
}
