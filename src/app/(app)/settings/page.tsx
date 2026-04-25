import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SettingsClient } from './settings-client';

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) redirect('/sign-in');

  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: 'credential',
      password: { not: null },
    },
  });

  return (
    <SettingsClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      hasPassword={!!credentialAccount}
    />
  );
}
