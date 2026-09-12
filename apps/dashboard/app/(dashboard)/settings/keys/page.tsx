import { fetchAPI } from '@/app/lib/api';
import WorkspaceKeysList from './WorkspaceKeysList';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function WorkspaceKeysPage() {
  const cookieStore = await cookies();
  const { workspaces } = await fetchAPI('/workspaces').catch(() => ({ workspaces: [] }));

  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding');
  }

  const activeWorkspaceId = cookieStore.get('relay_active_workspace')?.value;
  const workspace =
    workspaces.find((w: any) => w.id.toString() === activeWorkspaceId) || workspaces[0];

  let keys = [];
  try {
    const res = await fetchAPI(`/workspace-keys?workspaceId=${workspace.id}`);
    keys = res.keys || [];
  } catch (error) {
    console.error('Failed to fetch workspace keys', error);
  }

  return <WorkspaceKeysList keys={keys} workspaceId={workspace.id} />;
}
