import { NextRequest, NextResponse } from 'next/server';
import { AUTH_BASE_PATH, getAuthSessionCookieNames } from './src/lib/auth-config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — skip auth check
  const publicPaths = ['/sign-in', '/sign-up', AUTH_BASE_PATH];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionToken = getAuthSessionCookieNames().find(cookieName =>
    request.cookies.get(cookieName)
  );
  if (!sessionToken) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect root to dashboard for authenticated users
  if (pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
