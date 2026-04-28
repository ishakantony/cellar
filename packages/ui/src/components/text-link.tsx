import { Link } from 'react-router';
import { cn } from '../lib/cn';

type TextLinkBaseProps = {
  children: React.ReactNode;
  className?: string;
};

export type TextLinkProps =
  | (TextLinkBaseProps & { href: string; onClick?: never })
  | (TextLinkBaseProps & { onClick: () => void; href?: never });

export function TextLink(props: TextLinkProps) {
  const className = cn('text-primary hover:text-primary-dim transition-colors', props.className);

  if ('href' in props && props.href !== undefined) {
    return (
      <Link to={props.href} className={className}>
        {props.children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={className}>
      {props.children}
    </button>
  );
}
