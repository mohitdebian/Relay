import { fetchAPI } from '../lib/api';
function isRedirectError(error: any) {
  return error && error.message && error.message === 'NEXT_REDIRECT';
}

export async function getWorkspaceAnalyticsAction() {
  try {
    const res = await fetchAPI(`/analytics/overview`);

    return { success: true, analytics: res };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}
