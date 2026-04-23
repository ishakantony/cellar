'use client';

import { signIn, signUp } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { AuthTemplate } from '@/components/auth/auth-template';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { SocialLoginSection } from '@/components/auth/social-login-section';
import type { SignUpData } from '@/schemas/auth';

type SignUpPageClientProps = {
  callbackURL?: string;
};

export function SignUpPageClient({ callbackURL }: SignUpPageClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: SignUpData) => {
    const result = await signUp.email({
      ...data,
      ...(callbackURL ? { callbackURL } : {}),
    });
    if (result.error) {
      throw new Error(result.error.message ?? 'Sign up failed');
    }

    const redirectTarget =
      typeof result.data === 'object' &&
      result.data !== null &&
      'url' in result.data &&
      typeof result.data.url === 'string'
        ? result.data.url
        : undefined;

    router.push(redirectTarget ?? callbackURL ?? '/dashboard');
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
      footerLinkHref="/sign-in"
    />
  );
}
