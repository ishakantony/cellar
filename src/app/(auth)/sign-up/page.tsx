import { SignUpPageClient } from './sign-up-page-client';

type SignUpPageProps = {
  searchParams?: Promise<{
    callbackURL?: string | string[];
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = await searchParams;
  const callbackURL =
    typeof resolvedSearchParams?.callbackURL === 'string'
      ? resolvedSearchParams.callbackURL
      : undefined;

  return <SignUpPageClient callbackURL={callbackURL} />;
}
