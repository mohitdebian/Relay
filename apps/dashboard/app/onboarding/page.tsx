import { redirect } from 'next/navigation';
import { fetchAPI } from '../lib/api';
import OnboardingForm from './OnboardingForm';

export default async function OnboardingPage() {
  let fetchError = null;
  try {
    // Check if user already has a workspace
    const wsRes = await fetchAPI('/workspaces');
    if (wsRes.workspaces && wsRes.workspaces.length > 0) {
      redirect('/overview');
    }
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') throw err;
    fetchError = err?.message || 'Failed to connect to API';
  }

  if (fetchError) {
    return (
      <>
        <div className="bg-grid"></div>
        <div className="auth-shell">
          <div className="auth-box">
            <div className="auth-logo pixel">RELAY</div>
            <div className="panel auth-panel" style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '1rem' }}>Connection Error</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Unable to connect to the Relay API server.</p>
              <p style={{ color: 'var(--accent-red)', marginTop: '1rem', fontSize: '13px' }}>{fetchError}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-grid"></div>
      <div className="auth-shell">
        <div className="auth-box">
          <div className="auth-logo pixel">RELAY</div>

          <div className="panel auth-panel">
            <div className="auth-head">
              <h1 className="auth-title">Welcome to Relay</h1>
              <p className="auth-sub">Let's set up your first workspace.</p>
            </div>

            <OnboardingForm />
          </div>
        </div>
      </div>
    </>
  );
}
