'use client';

import { useState } from 'react';
import Modal from '../Modal';
import { Dropdown } from '../Dropdown';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setEmail('');
      setRole('Developer');
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(false);
    }, 200);
  };

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Import action dynamically to avoid top-level issues if needed, or just import it at top
    const { inviteMemberAction } = await import('@/app/actions/members');

    const result = await inviteMemberAction(email, role);

    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
    } else {
      setSuccessMsg('Invitation sent successfully!');
      setTimeout(() => {
        handleClose();
        window.location.reload(); // Quick way to refresh members list
      }, 1500);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invite Member">
      <form onSubmit={submitInvite}>
        <div className="modal-body">
          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="jane@acme.com"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Role</label>
            <Dropdown
              value={role}
              onChange={setRole}
              options={[
                { label: 'Admin', value: 'Admin' },
                { label: 'Developer', value: 'Developer' },
                { label: 'Viewer', value: 'Viewer' },
              ]}
            />
            <div className="hint">Admins can manage billing and workspace settings.</div>
          </div>
          {errorMsg && (
            <div style={{ color: 'var(--red)', marginTop: '10px', fontSize: '13px' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div
              style={{
                color: 'var(--green, #10b981)',
                marginTop: '10px',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {successMsg}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && !successMsg ? 'Inviting...' : 'Send Invite'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function InviteMemberButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + Invite member
      </button>
      <InviteMemberModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
