import { hashPassword } from 'better-auth/crypto';
import { count, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { account, asset, user } from '../db/schema';

const DEMO_USER_ID = 'demo-user-001';
const DEMO_USER_EMAIL = 'demo@cellar.app';
const DEMO_USER_PASSWORD = 'password123';

export async function seedIfEmpty() {
  const rows = await db.select({ value: count() }).from(user);
  const existingUserCount = rows[0]?.value ?? 0;

  if (existingUserCount > 0) {
    return { seeded: false, reason: 'users-exist' as const };
  }

  await db.insert(user).values({
    id: DEMO_USER_ID,
    name: 'Demo User',
    email: DEMO_USER_EMAIL,
    emailVerified: true,
  });

  await db.insert(account).values({
    userId: DEMO_USER_ID,
    providerId: 'credential',
    accountId: DEMO_USER_EMAIL,
    password: await hashPassword(DEMO_USER_PASSWORD),
  });

  await db.insert(asset).values([
    {
      userId: DEMO_USER_ID,
      type: 'SNIPPET',
      title: 'React useEffect Example',
      description: 'Basic useEffect pattern with cleanup',
      pinned: true,
      language: 'typescript',
      content: `useEffect(() => {
  const subscription = props.source.subscribe();
  return () => subscription.unsubscribe();
}, [props.source]);`,
    },
    {
      userId: DEMO_USER_ID,
      type: 'NOTE',
      title: 'Getting Started',
      content: 'Welcome to Cellar! This is your personal knowledge base.',
    },
    {
      userId: DEMO_USER_ID,
      type: 'LINK',
      title: 'Drizzle Documentation',
      url: 'https://orm.drizzle.team/docs',
    },
  ]);

  return { seeded: true, reason: 'fresh-db' as const };
}

// Compatibility: ensures the demo credential account exists even on later starts.
export async function ensureDemoUser() {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, DEMO_USER_EMAIL),
    columns: { id: true },
  });
  if (existing) return false;

  await db.insert(user).values({
    id: DEMO_USER_ID,
    name: 'Demo User',
    email: DEMO_USER_EMAIL,
    emailVerified: true,
  });
  await db.insert(account).values({
    userId: DEMO_USER_ID,
    providerId: 'credential',
    accountId: DEMO_USER_EMAIL,
    password: await hashPassword(DEMO_USER_PASSWORD),
  });
  return true;
}
