import { fetchAPI } from '@/app/lib/api';
import ApiDetailClient from './client';

export default async function ApiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { api } = await fetchAPI(`/apis/${id}`);

  let keys: any[] = [];
  try {
    const keysRes = await fetchAPI(`/apis/${id}/keys`);
    if (keysRes.keys) keys = keysRes.keys;
  } catch (e) {
    console.error('Failed to fetch keys', e);
  }

  // Analytics requires workspace_id, we can get it from the API details
  let analytics = null;
  if (api && api.workspace_id) {
    try {
      analytics = await fetchAPI(`/analytics/${api.workspace_id}/apis/${id}`);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  }

  return <ApiDetailClient api={api} keys={keys} analytics={analytics} />;
}
