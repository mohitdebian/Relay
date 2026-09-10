'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { switchWorkspaceAction } from '@/app/actions/workspace';

export default function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: any[];
  activeWorkspaceId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const activeWorkspace =
    workspaces.find((w) => w.id.toString() === activeWorkspaceId?.toString()) || workspaces[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (id: string) => {
    setIsOpen(false);
    startTransition(async () => {
      await switchWorkspaceAction(id, pathname);
    });
  };

  return (
    <div
      className="workspace-switcher"
      ref={dropdownRef}
      style={{ position: 'relative', margin: '20px', cursor: 'pointer' }}
    >
      <div
        className="switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          background: 'var(--bg-panel)',
          fontSize: '13px',
          fontWeight: 500,
          opacity: isPending ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: 'var(--text)',
              color: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ shapeRendering: 'crispEdges' }}
            >
              <path d="M4 4h6v2h10v14H4V4zm8 4H6v10h12V8h-6z" />
            </svg>
          </div>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '120px',
            }}
          >
            {activeWorkspace?.name || 'Select Workspace'}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>▼</span>
      </div>

      {isOpen && (
        <div
          className="switcher-dropdown panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            zIndex: 100,
            background: 'var(--bg)',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {workspaces.map((w) => (
            <div
              key={w.id}
              onClick={() => handleSelect(w.id.toString())}
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '4px',
                background:
                  w.id.toString() === activeWorkspaceId?.toString()
                    ? 'var(--bg-panel)'
                    : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-panel)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  w.id.toString() === activeWorkspaceId?.toString()
                    ? 'var(--bg-panel)'
                    : 'transparent')
              }
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  background:
                    w.id.toString() === activeWorkspaceId?.toString()
                      ? 'var(--text)'
                      : 'var(--border)',
                  color:
                    w.id.toString() === activeWorkspaceId?.toString()
                      ? 'var(--bg)'
                      : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ shapeRendering: 'crispEdges' }}
                >
                  <path d="M4 4h6v2h10v14H4V4zm8 4H6v10h12V8h-6z" />
                </svg>
              </div>
              {w.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
