'use client';

import { useState, useRef, useEffect } from 'react';
import { authClient } from '../lib/auth/client';
import { useRouter } from 'next/navigation';

export default function UserMenu({ email, avatarUrl }: { email: string; avatarUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    try {
      if (typeof authClient.signOut === 'function') {
        await authClient.signOut();
      }
    } catch (e) {
      console.error('Error signing out:', e);
    }
    // ensure we clear UI and redirect
    router.push('/login');
    // force a refresh so server components re-fetch without auth
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
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
          <div className="cd-option" onClick={handleLogout} style={{ color: 'var(--red)' }}>
            <span className="cd-option-label">Log out</span>
          </div>
        </div>
      )}
    </div>
  );
}
