'use client';

import React from 'react';

export default function ConnectionError({ error }: { error: string }) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="shell">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
          backgroundColor: 'var(--bg)',
          padding: '2rem',
        }}
      >
        <div
          className="panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '3rem 2rem',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              border: '1px solid var(--border)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path>
            </svg>
          </div>

          <h1
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            Connection Lost
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.5',
            }}
          >
            We are unable to reach the Relay API server. Please check your connection or try again
            shortly.
          </p>

          <div
            style={{
              backgroundColor: 'var(--red-dim)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px 16px',
              width: '100%',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'var(--red)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                fontWeight: 600,
              }}
            >
              Error Details
            </span>
            <code
              style={{
                fontSize: '13px',
                color: 'var(--red)',
                fontFamily: 'var(--font-mono, monospace)',
                wordBreak: 'break-all',
              }}
            >
              {error}
            </code>
          </div>

          <button
            onClick={handleRetry}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              height: '36px',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
