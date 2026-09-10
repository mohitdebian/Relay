'use client';

import { useState } from 'react';
import { removeMemberAction } from '@/app/actions/members';
import { ConfirmModal } from './modals/ConfirmModal';

export function RemoveMemberButton({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      const res = await removeMemberAction(userId);
      if (!res.success) {
        alert(res.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        title="Remove member"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--red)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
          fontSize: '13px',
          fontWeight: 500,
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.background = 'transparent';
        }}
      >
        {loading ? 'Removing...' : 'Remove'}
      </button>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleRemove}
        title="Remove Member"
        message="Are you sure you want to remove this member from the workspace?"
        confirmText="Remove"
        isDestructive={true}
        isLoading={loading}
      />
    </>
  );
}
