import { fetchAPI } from '@/app/lib/api';
import SettingsForm from './SettingsForm';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const { workspaces } = await fetchAPI('/workspaces').catch(() => ({ workspaces: [] }));

  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding');
  }

  const activeWorkspaceId = cookieStore.get('relay_active_workspace')?.value;
  const workspace =
    workspaces.find((w: any) => w.id.toString() === activeWorkspaceId) || workspaces[0];

  return <SettingsForm workspace={workspace} />;
}
