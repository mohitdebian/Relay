import { fetchAPI } from '@/app/lib/api';
import SettingsForm from './SettingsForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const { workspaces } = await fetchAPI('/workspaces').catch(() => ({ workspaces: [] }));

  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding');
  }

  // Right now, dashboard uses the first workspace if not explicitly provided
  const workspace = workspaces[0] || null;

  return <SettingsForm workspace={workspace} />;
}
