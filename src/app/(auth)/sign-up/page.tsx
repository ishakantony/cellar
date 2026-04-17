// src/app/(auth)/sign-up/page.tsx
"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AuthTemplate } from "@/components/auth/auth-template";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SocialLoginSection } from "@/components/auth/social-login-section";
import type { SignUpData } from "@/schemas/auth";

export default function SignUpPage() {
  const router = useRouter();

  const handleSubmit = async (data: SignUpData) => {
    const result = await signUp.email(data);
    if (result.error) {
      throw new Error(result.error.message ?? "Sign up failed");
    }
    router.push("/dashboard");
  };

  const handleGitHub = async () => {
    await signIn.social({ provider: "github", callbackURL: "/dashboard" });
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
