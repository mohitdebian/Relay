import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { fetchAPI } from '../lib/api';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  let result: { workspaces: Array<{ id: number; name: string }> | null; error: string | null };
  try {
    result = { ...(await fetchAPI('/workspaces')), error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DashboardLayout fetchAPI error:', message);
    result = { workspaces: null, error: message };
  }

  const { workspaces, error: fetchError } = result;

  if (fetchError) {
    return (
      <div className="shell">
        <div
          className="main-col"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
          }}
        >
          <div className="panel" style={{ maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Connection Error</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Unable to connect to the Relay API server.
            </p>
            <p style={{ color: 'var(--accent-red)', marginTop: '1rem', fontSize: '13px' }}>
              {fetchError}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
