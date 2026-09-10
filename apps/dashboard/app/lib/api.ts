const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from './auth/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:4000';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('__Secure-neon-auth.session_token')?.value ||
    cookieStore.get('neon-auth.session_token')?.value ||
    cookieStore.get('better-auth.session_token')?.value;

  if (!token) {
    console.log('NO TOKEN FOUND. COOKIES PRESENT:', cookieStore.getAll());
    redirect('/login');
    console.log('FETCHING:', `${API_URL}${endpoint}`);
  }

  const activeWorkspaceId = cookieStore.get('relay_active_workspace')?.value;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(activeWorkspaceId ? { 'x-workspace-id': activeWorkspaceId } : {}),
      ...options.headers,
    },
    // Prevent Next.js from aggressively caching dynamic API data
    cache: 'no-store',
  });

  if (res.status === 401) {
    redirect('/login');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }

  return res.json();
}
