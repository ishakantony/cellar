import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { proxy } from './proxy';

describe('proxy', () => {
  it('keeps auth protocol endpoints public', () => {
    const request = new NextRequest(
      'http://localhost:3000/api/auth/.well-known/openid-configuration'
    );
    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('redirects protected app routes to sign-in when the normalized session cookie is missing', () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/sign-in');
  });

  it('accepts the configured prefixed session cookie name', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'cellar.session_token=session-value',
      },
    });
    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it('also accepts the secure prefixed session cookie name', () => {
    const request = new NextRequest('https://cellar.example.com/dashboard', {
      headers: {
        cookie: '__Secure-cellar.session_token=session-value',
      },
    });
    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});
