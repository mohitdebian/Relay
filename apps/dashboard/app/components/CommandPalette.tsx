'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="topbar-search" onClick={() => setOpen(true)}>
        <span>
          Search APIs, endpoints, requests…
          <span className="cursor-blink"></span>
        </span>
        <span className="kbd">⌘K</span>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            className="modal-backdrop open"
            onClick={() => setOpen(false)}
            style={{ alignItems: 'flex-start', paddingTop: '12vh', backdropFilter: 'blur(2px)' }}
          >
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: 0,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-tertiary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search APIs, endpoints, and requests..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                  }}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    padding: '16px 12px',
                    fontSize: '14px',
                    color: 'var(--text)',
                  }}
                />
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--bg)',
                  }}
                >
                  ESC
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  textAlign: 'center',
                }}
              >
                {query ? 'No results found.' : 'Start typing to search...'}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
