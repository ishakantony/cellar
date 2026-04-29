import { Hono } from 'hono';
import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '../../db/client';
import { account } from '../../db/schema';
import { requireUser, type AuthVariables } from '../../lib/session-middleware';

export const settingsRoute = new Hono<{ Variables: AuthVariables }>()
  .use(requireUser)
  .get('/', async c => {
    const user = c.get('user');
    const credentialAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, user.id),
        eq(account.providerId, 'credential'),
        isNotNull(account.password)
      ),
      columns: { id: true },
    });
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      },
      hasPassword: !!credentialAccount,
    });
  });
