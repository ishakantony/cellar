import { useNavigate, useSearchParams } from 'react-router';
import { signIn, signUp } from '@/lib/auth-client';
import { AuthTemplate } from '@/components/auth/auth-template';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { SocialLoginSection } from '@/components/auth/social-login-section';
import type { SignUpData } from '@cellar/shared';

export function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callbackURL = searchParams.get('callbackURL') ?? undefined;

  const restQuery = (() => {
    const copy = new URLSearchParams(searchParams);
    copy.delete('callbackURL');
    const str = copy.toString();
    return str ? `?${str}` : '';
  })();
  const footerLinkHref = `/sign-in${restQuery}`;

  const handleSubmit = async (data: SignUpData) => {
    const result = await signUp.email({
      ...data,
      ...(callbackURL ? { callbackURL } : {}),
    });
    if (result.error) {
      throw new Error(result.error.message ?? 'Sign up failed');
    }
    const url = (result.data as { url?: string } | null)?.url ?? callbackURL;
    navigate(url ?? '/dashboard');
  };

  const handleGitHub = async () => {
    await signIn.social({ provider: 'github', callbackURL: callbackURL ?? '/dashboard' });
  };

  return (
    <AuthTemplate
      headerSubtitle="Create your vault"
      form={<SignUpForm onSubmit={handleSubmit} />}
      socialLogin={<SocialLoginSection onGitHubClick={handleGitHub} />}
      footerPrompt="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref={footerLinkHref}
    />
  );
}
