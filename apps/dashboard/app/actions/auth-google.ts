'use server';

import { cookies } from 'next/headers';
import { fetchAPI } from '../lib/api';
function isRedirectError(error: any) {
  return error && error.message && error.message === 'NEXT_REDIRECT';
}

export async function loginWithGoogle(id_token: string) {
  try {
    const res = await fetchAPI('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token }),
    });

    if (res.error) {
      return { error: res.error };
    }

    const cookieStore = await cookies();
    cookieStore.set('relay_token', res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { error: error.message || 'An error occurred during Google Login' };
  }
}
