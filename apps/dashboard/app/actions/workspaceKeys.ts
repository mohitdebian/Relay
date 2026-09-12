'use server';

import { fetchAPI } from '../lib/api';
import { revalidatePath } from 'next/cache';

function isRedirectError(error: any) {
  return (
    error &&
    (error.message === 'NEXT_REDIRECT' ||
      (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')))
  );
}

export async function createWorkspaceKeyAction(workspaceId: number, name: string) {
  try {
    const res = await fetchAPI('/workspace-keys', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, name }),
    });

    revalidatePath('/settings/keys');

    return { success: true, key: res };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}

export async function revokeWorkspaceKeyAction(id: number) {
  try {
    const res = await fetchAPI(`/workspace-keys/${id}`, {
      method: 'DELETE',
    });

    revalidatePath('/settings/keys');

    return { success: true, message: res.message };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}
