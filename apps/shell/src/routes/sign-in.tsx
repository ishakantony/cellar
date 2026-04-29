import { useNavigate, useSearchParams } from 'react-router';
import { signIn } from '@/lib/auth-client';
import { AuthTemplate } from '@/components/auth/auth-template';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SocialLoginSection } from '@/components/auth/social-login-section';
import type { SignInData } from '@cellar/shared';

const demoDefaults =
  import.meta.env.VITE_DEMO_MODE === 'true'
    ? { email: 'demo@cellar.app', password: 'password123' }
    : undefined;

export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callbackURL = searchParams.get('callbackURL') ?? undefined;

  const restQuery = (() => {
    const copy = new URLSearchParams(searchParams);
    copy.delete('callbackURL');
    const str = copy.toString();
    return str ? `?${str}` : '';
  })();
  const footerLinkHref = `/sign-up${restQuery}`;

  const handleSubmit = async (data: SignInData) => {
    const result = await signIn.email({
      ...data,
      ...(callbackURL ? { callbackURL } : {}),
    });
    if (result.error) {
      throw new Error(result.error.message ?? 'Sign in failed');
    }

    const url = (result.data as { url?: string } | null)?.url ?? callbackURL;
    navigate(url ?? '/vault');
  };

  const handleGitHub = async () => {
    await signIn.social({ provider: 'github', callbackURL: callbackURL ?? '/vault' });
  };

  return (
    <AuthTemplate
      headerSubtitle="Sign in to your vault"
      form={<SignInForm onSubmit={handleSubmit} defaultValues={demoDefaults} />}
      socialLogin={<SocialLoginSection onGitHubClick={handleGitHub} />}
      footerPrompt="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref={footerLinkHref}
    />
  );
}
