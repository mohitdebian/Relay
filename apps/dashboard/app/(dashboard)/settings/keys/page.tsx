import { fetchAPI } from '@/app/lib/api';
import WorkspaceKeysList from './WorkspaceKeysList';
import { redirect } from 'next/navigation';

export default async function WorkspaceKeysPage() {
  const { workspaces } = await fetchAPI('/workspaces').catch(() => ({ workspaces: [] }));

  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding');
  }

  // Right now, dashboard uses the first workspace if not explicitly provided
  const workspace = workspaces[0];

  let keys = [];
  try {
    const res = await fetchAPI(`/workspace-keys?workspaceId=${workspace.id}`);
    keys = res.keys || [];
  } catch (error) {
    console.error('Failed to fetch workspace keys', error);
  }

  return <WorkspaceKeysList keys={keys} workspaceId={workspace.id} />;
}
