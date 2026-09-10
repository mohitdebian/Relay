'use server';

import { fetchAPI } from '../lib/api';
import { revalidatePath } from 'next/cache';

// Fallback for checking redirect error in case isRedirectError is not exported
function isRedirectError(error: any) {
  return (
    error &&
    (error.message === 'NEXT_REDIRECT' ||
      (typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')))
  );
}

export async function createApiAction(name: string, environment: string, description: string) {
  try {
    // 1. Get user's workspaces to find the workspace_id
    const wsRes = await fetchAPI('/workspaces');
    if (!wsRes.workspaces || wsRes.workspaces.length === 0) {
      throw new Error('No workspaces found. Please create a workspace first.');
    }
    
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const cookieId = cookieStore.get('relay_active_workspace')?.value;
    const activeWorkspace = cookieId ? wsRes.workspaces.find((w: any) => w.id.toString() === cookieId) : wsRes.workspaces[0];
    const workspaceId = activeWorkspace?.id || wsRes.workspaces[0].id;

    // 2. Create the API
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'new-api';
    const res = await fetchAPI('/apis', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspaceId,
        name,
        slug,
        environment,
        description,
        upstream_url: 'https://example.com', // Default mock
      }),
    });

    // 3. Generate initial API key for this API
    const keyRes = await fetchAPI(`/apis/${res.api.id}/keys`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Default Key',
        environment,
      }),
    });

    // 4. Force Next.js to refresh the Server Components so they show the new API
    revalidatePath('/overview');
    revalidatePath('/apis');

    return { success: true, api: res.api, key: keyRes };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    console.error('Failed to create API:', error);
    return { success: false, error: error.message };
  }
}

export async function getApisAction() {
  try {
    const res = await fetchAPI('/apis');
    return { success: true, apis: res.apis };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}

export async function createApiKeyAction(apiId: number, name: string, environment: string) {
  try {
    const res = await fetchAPI(`/apis/${apiId}/keys`, {
      method: 'POST',
      body: JSON.stringify({ name, environment }),
    });

    revalidatePath('/keys');
    revalidatePath('/overview');

    return { success: true, key: res };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}
