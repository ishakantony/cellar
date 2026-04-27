import { hc } from 'hono/client';
import type { AppType } from '@cellar/api/app-type';

const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5201';

export const api = hc<AppType>(baseUrl, {
  init: {
    credentials: 'include',
  },
});
