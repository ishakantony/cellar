import { SignInPageClient } from './sign-in-page-client';

type SignInPageProps = {
  searchParams?: Promise<{
    callbackURL?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const callbackURL =
    typeof resolvedSearchParams?.callbackURL === 'string'
      ? resolvedSearchParams.callbackURL
      : undefined;

  return <SignInPageClient callbackURL={callbackURL} />;
}
