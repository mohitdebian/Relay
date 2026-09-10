import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/lib/auth/server';

const neonMiddleware = auth.middleware({ loginUrl: '/login' });

const PUBLIC_PATHS = ['/', '/login', '/register'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Always let neonMiddleware process the OAuth callback token
  if (request.nextUrl.searchParams.has('neon_auth_session_verifier')) {
    // neonMiddleware will consume the token, set the cookie, and redirect to strip the token
    return neonMiddleware(request);
  }

  if (isPublicPath(pathname)) {
    // Optionally: if we want to redirect logged-in users away from the landing page,
    // we would check the session here. For now, we just don't force them to login.
    return NextResponse.next();
  }

  return neonMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
