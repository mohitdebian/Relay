'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function switchWorkspaceAction(workspaceId: string, currentPath: string) {
  const cookieStore = await cookies();
  
  // Set the active workspace cookie (expires in 30 days)
  cookieStore.set('relay_active_workspace', workspaceId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Revalidate the current path to fetch data for the new workspace
  revalidatePath(currentPath);
  redirect(currentPath);
}
import { fetchAPI } from '../lib/api';

function isRedirectError(error: any) {
  return (
    error &&
    (error.message === 'NEXT_REDIRECT' ||
      (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')))
  );
}

export async function createWorkspaceAction(prevState: any, formData: FormData) {
  try {
    const name = formData.get('workspace') as string;
    if (!name) return { error: 'Workspace name is required' };

    const res = await fetchAPI('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    const cookieStore = await cookies();
    cookieStore.set('relay_active_workspace', res.workspace.id.toString(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath('/overview');
  } catch (error: any) {
    if (isRedirectError(error)) redirect('/overview');
    return { error: error.message || 'Failed to create workspace' };
  }
  redirect('/overview');
}

export async function updateWorkspaceAction(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const cookieStore = await cookies();
    const workspaceId = cookieStore.get('relay_active_workspace')?.value;
    
    if (!workspaceId) return { error: 'No active workspace' };
    if (!name) return { error: 'Name is required' };

    await fetchAPI(`/workspaces/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update workspace' };
  }
}

export async function deleteWorkspaceAction(id?: string) {
  try {
    const cookieStore = await cookies();
    const workspaceId = cookieStore.get('relay_active_workspace')?.value;
    
    if (!workspaceId) return { error: 'No active workspace' };

    await fetchAPI(`/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
    
    // Clear the active workspace cookie since it's deleted
    cookieStore.delete('relay_active_workspace');
  } catch (error: any) {
    if (isRedirectError(error)) redirect('/overview');
    return { error: error.message || 'Failed to delete workspace' };
  }
  redirect('/overview');
}

export async function deleteAccountAction() {
  try {
    await fetchAPI('/users/me', {
      method: 'DELETE',
    });
    
    const cookieStore = await cookies();
    cookieStore.delete('relay_active_workspace');
  } catch (error: any) {
    if (isRedirectError(error)) redirect('/');
    return { error: error.message || 'Failed to delete account' };
  }
  redirect('/');
}
