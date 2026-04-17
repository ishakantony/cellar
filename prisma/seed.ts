import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.assetCollection.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      id: 'demo-user-001',
      name: 'Demo User',
      email: 'demo@cellar.app',
      emailVerified: true,
    },
  });

  // Create credential account with hashed password
  await prisma.account.create({
    data: {
      userId: demoUser.id,
      providerId: 'credential',
      accountId: demoUser.email,
      password: await hashPassword('password123'),
    },
  });

  // Create sample assets
  await prisma.asset.createMany({
    data: [
      {
        userId: demoUser.id,
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
        userId: demoUser.id,
        type: 'NOTE',
        title: 'Getting Started',
        content: 'Welcome to Cellar! This is your personal knowledge base.',
      },
      {
        userId: demoUser.id,
        type: 'LINK',
        title: 'Prisma Documentation',
        url: 'https://www.prisma.io/docs',
      },
    ],
  });

  console.log('✅ Seed complete: demo@cellar.app / password123');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
