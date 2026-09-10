'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || 'Failed to login' };
    }

    const data = await res.json();

    const cookieStore = await cookies();
    cookieStore.set('relay_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }

  redirect('/overview');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('relay_token');
  redirect('/login');
}

export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const workspace = formData.get('workspace');
  const name = formData.get('name'); // Not strictly required by backend yet, but good to have

  if (!email || !password || !workspace) {
    return { error: 'Email, password, and workspace name are required' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, workspace_name: workspace }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || 'Failed to register' };
    }

    const data = await res.json();

    const cookieStore = await cookies();
    cookieStore.set('relay_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }

  redirect('/overview');
}
