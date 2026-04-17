// src/app/(auth)/sign-in/page.tsx
'use client';

import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { AuthTemplate } from '@/components/auth/auth-template';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SocialLoginSection } from '@/components/auth/social-login-section';
import type { SignInData } from '@/schemas/auth';

export default function SignInPage() {
  const router = useRouter();

  const handleSubmit = async (data: SignInData) => {
    const result = await signIn.email(data);
    if (result.error) {
      throw new Error(result.error.message ?? 'Sign in failed');
    }
    router.push('/dashboard');
  };

  const handleGitHub = async () => {
    await signIn.social({ provider: 'github', callbackURL: '/dashboard' });
  };

  return (
    <AuthTemplate
      headerSubtitle="Sign in to your vault"
      form={<SignInForm onSubmit={handleSubmit} />}
      socialLogin={<SocialLoginSection onGitHubClick={handleGitHub} />}
      footerPrompt="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/sign-up"
    />
  );
}
