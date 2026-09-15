'use client';

import React from 'react';

export default function ConnectionError({ error }: { error: string }) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg, #000)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* Subtle Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '60vw',
          maxWidth: '800px',
          maxHeight: '800px',
          background: 'radial-gradient(circle, rgba(60, 60, 60, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: 'rgba(20, 20, 20, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '3rem 2rem',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary, #a1a1aa)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path>
          </svg>
        </div>

        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text, #fff)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Connection Lost
        </h1>
        
        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary, #a1a1aa)',
            marginBottom: '2rem',
            lineHeight: '1.5',
          }}
        >
          We are unable to reach the Relay API server. Please check your connection or try again shortly.
        </p>

        <div
          style={{
            backgroundColor: 'rgba(255, 50, 50, 0.1)',
            border: '1px solid rgba(255, 50, 50, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            width: '100%',
            marginBottom: '2rem',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255, 100, 100, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>Error Details</span>
          <code style={{ fontSize: '0.85rem', color: '#ff8888', fontFamily: 'var(--font-mono, monospace)', wordBreak: 'break-all' }}>
            {error}
          </code>
        </div>

        <button
          onClick={handleRetry}
          style={{
            backgroundColor: 'var(--text, #fff)',
            color: 'var(--bg, #000)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.6rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease, transform 0.1s ease',
            width: '100%',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
