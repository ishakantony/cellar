import { createMiddleware } from 'hono/factory';
import { auth } from '../auth/auth';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null | undefined;
  emailVerified: boolean;
};

export type AuthVariables = {
  user: AuthUser;
};

export const requireUser = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', session.user as AuthUser);
  await next();
});
