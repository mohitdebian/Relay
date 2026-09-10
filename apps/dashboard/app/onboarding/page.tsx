import { redirect } from 'next/navigation';
import { fetchAPI } from '../lib/api';
import OnboardingForm from './OnboardingForm';

export default async function OnboardingPage() {
  try {
    // Check if user already has a workspace
    const wsRes = await fetchAPI('/workspaces');
    if (wsRes.workspaces && wsRes.workspaces.length > 0) {
      redirect('/overview');
    }
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') throw err;
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
