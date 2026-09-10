'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { authClient } from '@/app/lib/auth/client';

function ForgotPasswordContent() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      // @ts-ignore: Neon Auth email-otp plugin overwrites the call signature in types
      const { error: resetError } = await authClient.forgetPassword({
        email,
        redirectTo: window.location.origin + '/reset-password',
      });

      if (resetError) {
        setError(resetError.message || 'Unknown error');
        setIsPending(false);
        return;
      }

      setIsSuccess(true);
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
            <div className="auth-title pixel">RESET PASSWORD</div>
            <div className="auth-sub">Enter your email to receive a reset link</div>
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
                  Check your email
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  We&apos;ve sent a password reset link to your email address.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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
                <button type="submit" className="btn btn-primary auth-submit" disabled={isPending}>
                  {isPending ? 'Sending...' : 'Send reset link'}
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

export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  );
}
