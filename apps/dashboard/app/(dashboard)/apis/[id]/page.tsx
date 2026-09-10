import { fetchAPI } from '@/app/lib/api';
import ApiDetailClient from './client';

export default async function ApiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { api } = await fetchAPI(`/apis/${id}`);
  const { keys } = await fetchAPI(`/apis/${id}/keys`);

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
