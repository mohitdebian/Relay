'use client';

import { useState, useRef, useEffect } from 'react';
import { authClient } from '../lib/auth/client';

export default function UserMenu({ email, avatarUrl }: { email: string; avatarUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Client-side Better Auth sign-out with timeout protection
      if (authClient && typeof authClient.signOut === 'function') {
        await Promise.race([
          authClient.signOut().catch((e: unknown) => console.error('Client sign-out error:', e)),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      }
    } catch (e) {
      console.error('Error during client signOut:', e);
    }

    try {
      // 2. Dedicated server-side logout route to clear HTTP-only session cookies
      await Promise.race([
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch((e) => console.error('Logout API error:', e)),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (e) {
      console.error('Error during server logout call:', e);
    }

    // 3. Clear non-httpOnly cookies accessible by document
    try {
      document.cookie =
        'relay_active_workspace=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (_) {}

    // 4. Hard full-page navigation to destroy React Server Component router cache
    window.location.href = '/login';
  };

  return (
    <div className="custom-dropdown" ref={containerRef} style={{ width: 'auto' }}>
      <div
        className="avatar"
        title={email}
        style={{ background: 'transparent', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src={avatarUrl} alt="Avatar" width={26} height={26} style={{ borderRadius: '50%' }} />
      </div>

      {isOpen && (
        <div
          className="cd-panel"
          style={{
            width: '160px',
            right: 0,
            left: 'auto',
            top: 'calc(100% + 8px)',
            padding: '4px',
          }}
        >
          <div
            className="cd-option"
            style={{
              padding: '6px 10px',
              marginBottom: '4px',
              borderBottom: '1px solid var(--border)',
              cursor: 'default',
              background: 'transparent',
            }}
          >
            <span
              className="cd-option-label"
              style={{ color: 'var(--text-secondary)', fontSize: '11px' }}
            >
              {email}
            </span>
          </div>
          <div
            className="cd-option"
            onClick={handleLogout}
            style={{
              color: 'var(--red)',
              cursor: isLoggingOut ? 'wait' : 'pointer',
              opacity: isLoggingOut ? 0.6 : 1,
            }}
          >
            <span className="cd-option-label">
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
