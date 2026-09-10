import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { fetchAPI } from '../lib/api';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const { workspaces } = await fetchAPI('/workspaces').catch((error) => {
    console.error('DashboardLayout fetchAPI error:', error);
    return { workspaces: [] };
  });

  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding');
  }

  const activeWorkspaceId =
    cookieStore.get('relay_active_workspace')?.value || workspaces[0].id.toString();

  return (
    <div className="shell">
      <Sidebar workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      <div className="main-col">
        <Topbar />
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
