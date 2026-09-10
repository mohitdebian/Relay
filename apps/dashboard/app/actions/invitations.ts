'use server';

import { fetchAPI } from '../lib/api';

function isRedirectError(error: any) {
  return error && error.digest && error.digest.startsWith('NEXT_REDIRECT');
}

export async function getInvitationsAction() {
  try {
    const res = await fetchAPI('/invitations');
    return { success: true, invitations: res.invitations || [] };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, invitations: [], error: error.message };
  }
}

export async function acceptInvitationAction(inviteId: string) {
  try {
    const res = await fetchAPI(`/invitations/${inviteId}/accept`, { method: 'POST' });
    return { success: true, data: res };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}

export async function rejectInvitationAction(inviteId: string) {
  try {
    const res = await fetchAPI(`/invitations/${inviteId}/reject`, { method: 'POST' });
    return { success: true, data: res };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}
