import { fetchAPI } from '../lib/api';
function isRedirectError(error: any) {
  return error && error.message && error.message === 'NEXT_REDIRECT';
}

export async function getWebhooksAction() {
  try {
    const res = await fetchAPI(`/webhooks`);

    return { success: true, webhooks: res.webhooks };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}

export async function createWebhookAction(url: string, events: string[]) {
  try {
    const res = await fetchAPI(`/webhooks`, {
      method: 'POST',
      body: JSON.stringify({ url, events }),
    });

    return { success: true, webhook: res.webhook };
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: error.message };
  }
}
