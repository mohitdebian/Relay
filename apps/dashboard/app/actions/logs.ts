import { fetchAPI } from '../lib/api';
function isRedirectError(error: any) {
  return error && error.message && error.message === 'NEXT_REDIRECT';
}

export async function getLogsAction() {
  try {
    const res = await fetchAPI(`/logs`);

    return { success: true, logs: res.logs };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}
