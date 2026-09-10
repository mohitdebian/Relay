'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { authClient } from '@/app/lib/auth/client';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Better Auth reads the `token` from the URL automatically
  // But we can check if it exists and show an error if it's missing
  useEffect(() => {
    if (!searchParams.get('token')) {
      setError('Invalid or missing reset token.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;

    try {

      const { error: resetError } = await authClient.resetPassword({
        newPassword,
      });

      if (resetError) {
        setError(resetError.message || 'Unknown error');
        setIsPending(false);
        return;
      }

      setIsSuccess(true);
      // Wait a moment then redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
            <div className="auth-title pixel">NEW PASSWORD</div>
            <div className="auth-sub">Enter a new password for your account</div>
          </div>

          <div className="panel auth-panel">
            <div
              className={`auth-error ${error ? 'show' : ''}`}
              style={{ marginBottom: error ? '16px' : '0' }}
            >
              {error}
            </div>

            {isSuccess ? (
              <div className="auth-success" style={{ textAlign: 'center', margin: '20px 0' }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="2"
                  style={{ marginBottom: '16px' }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div style={{ color: 'var(--text)', marginBottom: '8px', fontWeight: 500 }}>
                  Password reset successfully
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Redirecting you to sign in...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    name="password"
                    required
                    disabled={isPending || !!error}
                  />
                  <div className="hint" style={{ marginTop: '8px' }}>
                    Minimum 8 characters, one number.
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={isPending || !!error}
                >
                  {isPending ? 'Updating...' : 'Update password'}
                </button>
              </form>
            )}
          </div>

          <div className="auth-switch">
            <Link href="/login">Back to sign in</Link>
          </div>
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

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
