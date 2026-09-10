import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth/server';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    let session = null;
    try {
      session = await (auth as any).getSession?.({
        headers: await headers(),
      });
      if (!session && typeof auth.getSession === 'function') {
        session = await auth.getSession();
      }
    } catch (e) {}

    // Also try auth.getJWTToken if it exists
    let jwt = null;
    try {
      jwt = await (auth as any).getJWTToken?.();
    } catch (e) {}

    return NextResponse.json({ session, jwt, available: Object.keys(auth) });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
