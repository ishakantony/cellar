'use client';

import { signIn } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthTemplate } from '@/components/auth/auth-template';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SocialLoginSection } from '@/components/auth/social-login-section';
import type { SignInData } from '@/schemas/auth';

type SignInPageClientProps = {
  callbackURL?: string;
};

export function SignInPageClient({ callbackURL }: SignInPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const footerLinkHref = (() => {
    const query = searchParams.toString();
    return query ? `/sign-up?${query}` : '/sign-up';
  })();

  const handleSubmit = async (data: SignInData) => {
    const result = await signIn.email({
      ...data,
      ...(callbackURL ? { callbackURL } : {}),
    });
    if (result.error) {
      throw new Error(result.error.message ?? 'Sign in failed');
    }

    const redirectTarget = result.data?.url ?? callbackURL;
    if (redirectTarget) {
      router.push(redirectTarget);
      return;
    }

    router.push('/dashboard');
  };

  const handleGitHub = async () => {
    await signIn.social({ provider: 'github', callbackURL: callbackURL ?? '/dashboard' });
  };

  return (
    <AuthTemplate
      headerSubtitle="Sign in to your vault"
      form={<SignInForm onSubmit={handleSubmit} />}
      socialLogin={<SocialLoginSection onGitHubClick={handleGitHub} />}
      footerPrompt="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref={footerLinkHref}
    />
  );
}
