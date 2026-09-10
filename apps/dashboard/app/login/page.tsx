'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/app/lib/auth/client';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError === 'account_not_linked') {
      setMode('signin');
      setShowNotice(true);
      // Strip the error param from the URL so retries don't loop
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  const isSignup = mode === 'signup';

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsPending(true);
    setError('');
    try {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: '/overview',
      });
      if (error) {
        setError(error.message || `Failed to login with ${provider}`);
        setIsPending(false);
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during social login');
      setIsPending(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isSignup) {
        const name = formData.get('name') as string;
        const workspace = formData.get('workspace') as string;

        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: name || workspace.split('-')[0],
        });

        if (signUpError) {
          setError(signUpError.message || 'Unknown error');
          setIsPending(false);
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || 'Unknown error');
          setIsPending(false);
          return;
        }
      }

      // Use hard navigation so the session cookie is picked up by middleware
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/overview';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsPending(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="auth-box">
          <div className="auth-logo pixel">RELAY_</div>

          <div className="auth-head">
            <div className="auth-title pixel">{isSignup ? 'CREATE ACCOUNT' : 'SIGN IN'}</div>
            <div className="auth-sub">
              {isSignup ? 'Set up a new workspace' : 'Welcome back — sign in to continue'}
            </div>
          </div>

          {showNotice && (
            <div className="auth-notice">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="7" />
                <path d="M8 4.5v4M8 11v.5" />
              </svg>
              <span>
                An account with this email already exists. Please sign in with your email and
                password instead.
              </span>
            </div>
          )}

          <div className="panel auth-panel">
            <div className="oauth-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSocialLogin('github')}
                disabled={isPending}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                </svg>
                Continue with GitHub
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSocialLogin('google')}
                disabled={isPending}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M15.68 8.18c0-.58-.05-1.13-.15-1.66H8v3.14h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.9Z" />
                  <path d="M8 16c2.16 0 3.97-.71 5.29-1.92l-2.58-2c-.72.48-1.63.76-2.71.76-2.08 0-3.85-1.4-4.48-3.29H.86v2.07A8 8 0 0 0 8 16Z" />
                  <path d="M3.52 9.55A4.8 4.8 0 0 1 3.27 8c0-.54.09-1.06.25-1.55V4.38H.86A8 8 0 0 0 0 8c0 1.29.31 2.51.86 3.62l2.66-2.07Z" />
                  <path d="M8 3.16c1.17 0 2.23.4 3.06 1.19l2.29-2.29A7.94 7.94 0 0 0 8 0 8 8 0 0 0 .86 4.38l2.66 2.07C4.15 4.56 5.92 3.16 8 3.16Z" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="divider">
              <div className="line"></div>
              <span>or</span>
              <div className="line"></div>
            </div>

            <div
              className={`auth-error ${error ? 'show' : ''}`}
              style={{ marginBottom: error ? '16px' : '0' }}
            >
              {error}
            </div>

            <form onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <div className="field auth-only-signup">
                    <label>Workspace name</label>
                    <input
                      type="text"
                      placeholder="acme-workspace"
                      name="workspace"
                      required={isSignup}
                      disabled={isPending}
                    />
                  </div>
                  <div className="field auth-only-signup">
                    <label>Full name</label>
                    <input
                      type="text"
                      placeholder="Maya Gomez"
                      name="name"
                      required={isSignup}
                      disabled={isPending}
                    />
                  </div>
                </>
              )}
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  name="email"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="field">
                <div className="field-label-row">
                  <label>Password</label>
                  {!isSignup && (
                    <Link className="auth-forgot auth-only-signin" href="/forgot-password">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  required
                  disabled={isPending}
                />
                {isSignup && (
                  <div className="hint auth-only-signup">Minimum 8 characters, one number.</div>
                )}
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={isPending}>
                {isSignup
                  ? isPending
                    ? 'Creating...'
                    : 'Create account'
                  : isPending
                    ? 'Signing in...'
                    : 'Sign in'}
              </button>
            </form>
          </div>

          <div className="auth-switch">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <a
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                >
                  Sign in
                </a>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <a
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                >
                  Sign up
                </a>
              </>
            )}
          </div>
          {isSignup && (
            <div className="auth-terms">
              By creating an account, you agree to the <Link href="#">Terms of Service</Link> and{' '}
              <Link href="#">Privacy Policy</Link>.
            </div>
          )}
        </div>

        <div className="auth-footer">© 2026 Relay · Privacy · Terms · Status</div>
      </div>

      <div className="auth-right">
        <div className="preview-panel-wrap">
          <div className="preview-copy">
            <h2 className="pixel">Your API infrastructure, under control.</h2>
            <p>Ship faster with real-time observability, instant API keys, and seamless scaling.</p>
          </div>

          <div className="preview-frame">
            <div className="preview-titlebar">
              <div className="preview-dots">
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
                <div className="preview-dot"></div>
              </div>
              <div className="preview-path">~/acme-workspace/overview</div>
            </div>

            <div className="preview-content">
              {/* Stat row */}
              <div className="preview-stats">
                <div className="preview-stat">
                  <div className="preview-stat-label">Requests (24h)</div>
                  <div className="preview-stat-value">3.2M</div>
                  <div className="preview-stat-delta positive">+12%</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-label">Success rate</div>
                  <div className="preview-stat-value" style={{ color: 'var(--green)' }}>
                    99.99%
                  </div>
                  <div className="preview-stat-delta">—</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-label">p95 latency</div>
                  <div className="preview-stat-value">42ms</div>
                  <div className="preview-stat-delta positive">-5ms</div>
                </div>
              </div>

              {/* API list */}
              <div className="preview-table">
                <div className="preview-table-head">
                  <span>API</span>
                  <span>REQUESTS</span>
                  <span>LATENCY</span>
                  <span style={{ textAlign: 'right' }}>STATUS</span>
                </div>
                <div className="preview-table-row">
                  <div>
                    <div className="preview-api-name">production-api</div>
                    <div className="preview-api-meta">
                      REST · v1 <span className="preview-tag">production</span>
                    </div>
                  </div>
                  <div>2.8M</div>
                  <div>45ms</div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="preview-status">
                      <span className="preview-status-dot green"></span>Active
                    </span>
                  </div>
                </div>
                <div className="preview-table-row">
                  <div>
                    <div className="preview-api-name">staging-api</div>
                    <div className="preview-api-meta">
                      REST · v1 <span className="preview-tag">staging</span>
                    </div>
                  </div>
                  <div>421K</div>
                  <div>38ms</div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="preview-status">
                      <span className="preview-status-dot green"></span>Active
                    </span>
                  </div>
                </div>
                <div className="preview-table-row">
                  <div>
                    <div className="preview-api-name">internal-api</div>
                    <div className="preview-api-meta">
                      REST · v2 <span className="preview-tag">production</span>
                    </div>
                  </div>
                  <div>89K</div>
                  <div>22ms</div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="preview-status">
                      <span className="preview-status-dot green"></span>Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          LOADING...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
