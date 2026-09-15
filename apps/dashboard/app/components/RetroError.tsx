'use client';

import React, { useEffect, useState } from 'react';

export default function RetroError({ error }: { error: string }) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink((b) => !b);
    }, 500);
    return () => clearInterval(interval);
  }, []);

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
        width: '100vw',
        backgroundColor: '#050505',
        color: '#fff',
        fontFamily: '"Courier New", Courier, monospace',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* CRT Scanline Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 3px 100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Glow / Vignette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)',
          pointerEvents: 'none',
          zIndex: 9,
        }}
      />

      <div style={{ zIndex: 20, maxWidth: '600px', padding: '2rem' }}>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#ff0055',
            textShadow: '3px 3px 0 #00ffff, -3px -3px 0 #ffff00',
            marginBottom: '1rem',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          GAME OVER
        </h1>
        <h2
          style={{
            fontSize: '1.5rem',
            color: '#00ffff',
            marginBottom: '2rem',
            textShadow: '0 0 10px rgba(0,255,255,0.5)',
          }}
        >
          - CONNECTION ERROR -
        </h2>

        <div
          style={{
            border: '4px solid #fff',
            padding: '1.5rem',
            backgroundColor: '#000',
            boxShadow: '8px 8px 0 #ff0055',
            marginBottom: '3rem',
          }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ccc' }}>
            Unable to connect to the Relay API server.
          </p>
          <p
            style={{
              fontSize: '1rem',
              color: '#ffff00',
              wordBreak: 'break-all',
            }}
          >
            ERR: {error}
          </p>
        </div>

        <button
          onClick={handleRetry}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#00ffcc',
            fontSize: '1.5rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
            textTransform: 'uppercase',
            opacity: blink ? 1 : 0,
          }}
        >
          [ INSERT COIN TO RETRY ]
        </button>
      </div>
    </div>
  );
}
