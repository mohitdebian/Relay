'use client';

import { useState, useRef, useEffect } from 'react';

interface Invitation {
  id: number;
  workspace_name: string;
  workspace_slug: string;
  role: string;
  invited_by_email: string;
  created_at: string;
}

export default function InboxBell({
  invitations: initialInvitations,
}: {
  invitations: Invitation[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [loading, setLoading] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = async (inviteId: number) => {
    setLoading(inviteId);
    const { acceptInvitationAction } = await import('@/app/actions/invitations');
    const result = await acceptInvitationAction(inviteId.toString());
    if (result.success) {
      setInvitations(invitations.filter((i) => i.id !== inviteId));
      setIsOpen(false);
      window.location.reload();
    }
    setLoading(null);
  };

  const handleReject = async (inviteId: number) => {
    setLoading(inviteId);
    const { rejectInvitationAction } = await import('@/app/actions/invitations');
    const result = await rejectInvitationAction(inviteId.toString());
    if (result.success) {
      setInvitations(invitations.filter((i) => i.id !== inviteId));
    }
    setLoading(null);
  };

  const count = invitations.length;

  return (
    <div className="custom-dropdown" ref={containerRef} style={{ width: 'auto' }}>
      <div
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Bell icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              background: 'var(--red)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {count}
          </span>
        )}
      </div>

      {isOpen && (
        <div
          className="cd-panel"
          style={{
            width: '320px',
            right: 0,
            left: 'auto',
            top: 'calc(100% + 8px)',
            padding: '0',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.5px',
            }}
          >
            INBOX {count > 0 && `(${count})`}
          </div>

          {count === 0 && (
            <div
              style={{
                padding: '24px 14px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px',
              }}
            >
              No pending invitations
            </div>
          )}

          {invitations.map((invite) => (
            <div
              key={invite.id}
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {invite.invited_by_email}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}> invited you to </span>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                  {invite.workspace_name}
                </span>
              </div>
              <div
                style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}
              >
                Role: {invite.role} · {new Date(invite.created_at).toLocaleDateString()}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '11px', padding: '4px 12px' }}
                  onClick={() => handleAccept(invite.id)}
                  disabled={loading === invite.id}
                >
                  {loading === invite.id ? '...' : 'Accept'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 12px' }}
                  onClick={() => handleReject(invite.id)}
                  disabled={loading === invite.id}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
