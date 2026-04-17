import { AuthHeader } from './auth-header';
import { AuthFooter } from './auth-footer';
import { cn } from '@/lib/utils';

export interface AuthTemplateProps {
  headerSubtitle: string;
  form: React.ReactNode;
  socialLogin?: React.ReactNode;
  footerPrompt: string;
  footerLinkText: string;
  footerLinkHref: string;
  className?: string;
}

export function AuthTemplate({
  headerSubtitle,
  form,
  socialLogin,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
  className,
}: AuthTemplateProps) {
  return (
    <div className={cn('w-full max-w-sm', className)}>
      <AuthHeader subtitle={headerSubtitle} />
      {form}
      {socialLogin}
      <AuthFooter prompt={footerPrompt} linkText={footerLinkText} linkHref={footerLinkHref} />
    </div>
  );
}
