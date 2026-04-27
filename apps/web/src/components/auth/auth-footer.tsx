import { TextLink, cn } from '@cellar/ui';
export interface AuthFooterProps {
  prompt: string;
  linkText: string;
  linkHref: string;
  className?: string;
}

export function AuthFooter({ prompt, linkText, linkHref, className }: AuthFooterProps) {
  return (
    <p className={cn('mt-6 text-center text-xs text-outline', className)}>
      {prompt} <TextLink href={linkHref}>{linkText}</TextLink>
    </p>
  );
}
