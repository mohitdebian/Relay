import { NextRequest, NextResponse } from 'next/server';

const NEON_AUTH_URL =
  process.env.NEON_AUTH_BASE_URL ||
  'https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth';

const COOKIES_TO_DELETE = [
  '__Secure-neon-auth.session_token',
  '__Secure-neon-auth.local.session_data',
  '__Secure-neon-auth.session_data',
  '__Secure-neon-auth.dont_remember',
  'neon-auth.session_token',
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
  'relay_active_workspace',
];

function applyClearedCookies(response: NextResponse) {
  for (const name of COOKIES_TO_DELETE) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    await fetch(`${NEON_AUTH_URL}/sign-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({}),
    }).catch((e) => console.error('Upstream sign-out fetch error:', e));
  } catch (err) {
    console.error('Logout error:', err);
  }

  const response = NextResponse.json({ success: true });
  applyClearedCookies(response);
  return response;
}

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    await fetch(`${NEON_AUTH_URL}/sign-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({}),
    }).catch((e) => console.error('Upstream sign-out fetch error:', e));
  } catch (err) {
    console.error('Logout error:', err);
  }

  const response = NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  applyClearedCookies(response);
  return response;
}
