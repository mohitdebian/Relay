'use server';

import { fetchAPI } from '../lib/api';
import { revalidatePath } from 'next/cache';
function isRedirectError(error: any) {
  return error && error.message && error.message === 'NEXT_REDIRECT';
}

export async function getMembersAction() {
  try {
    const wsRes = await fetchAPI('/workspaces');
    if (!wsRes.workspaces || wsRes.workspaces.length === 0)
      return { success: true, members: [], invitations: [] };

    const cookieStore = await import('next/headers').then((m) => m.cookies());
    const cookieId = cookieStore.get('relay_active_workspace')?.value;
    const activeWorkspace = cookieId
      ? wsRes.workspaces.find((w: any) => w.id.toString() === cookieId)
      : wsRes.workspaces[0];
    const workspaceId = activeWorkspace?.id || wsRes.workspaces[0].id;
    const currentRole = activeWorkspace?.role || wsRes.workspaces[0].role;

    const res = await fetchAPI(`/workspaces/${workspaceId}/members`);

    return { success: true, members: res.members, invitations: res.invitations || [], currentRole };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}

export async function inviteMemberAction(email: string, role: string) {
  try {
    const wsRes = await fetchAPI('/workspaces');
    if (!wsRes.workspaces || wsRes.workspaces.length === 0) {
      return { success: false, error: 'No workspace found' };
    }

    const cookieStore = await import('next/headers').then((m) => m.cookies());
    const cookieId = cookieStore.get('relay_active_workspace')?.value;
    const activeWorkspace = cookieId
      ? wsRes.workspaces.find((w: any) => w.id.toString() === cookieId)
      : wsRes.workspaces[0];
    const workspaceId = activeWorkspace?.id || wsRes.workspaces[0].id;

    const res = await fetchAPI(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email: email, role: role }),
    });

    return { success: true, data: res };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}

export async function removeMemberAction(userId: string) {
  try {
    const wsRes = await fetchAPI('/workspaces');
    if (!wsRes.workspaces || wsRes.workspaces.length === 0) {
      return { success: false, error: 'No workspace found' };
    }

    const cookieStore = await import('next/headers').then((m) => m.cookies());
    const cookieId = cookieStore.get('relay_active_workspace')?.value;
    const activeWorkspace = cookieId
      ? wsRes.workspaces.find((w: any) => w.id.toString() === cookieId)
      : wsRes.workspaces[0];
    const workspaceId = activeWorkspace?.id || wsRes.workspaces[0].id;

    const res = await fetchAPI(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });

    revalidatePath('/members');
    return { success: true, data: res };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}
