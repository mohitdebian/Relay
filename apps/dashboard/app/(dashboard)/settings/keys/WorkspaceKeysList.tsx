'use client';

import { useState } from 'react';
import Typewriter from '@/app/components/Typewriter';
import Modal from '@/app/components/Modal';
import { ConfirmModal } from '@/app/components/modals/ConfirmModal';
import { createWorkspaceKeyAction, revokeWorkspaceKeyAction } from '@/app/actions/workspaceKeys';

interface WorkspaceKey {
  id: number;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export default function WorkspaceKeysList({
  keys,
  workspaceId,
}: {
  keys: WorkspaceKey[];
  workspaceId: number;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [copyText, setCopyText] = useState('Copy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdData, setCreatedData] = useState<{ rawKey: string } | null>(null);
  const [revokeKeyId, setRevokeKeyId] = useState<number | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep(1);
      setName('');
      setCopyText('Copy');
      setError('');
      setIsSubmitting(false);
      setCreatedData(null);
    }, 200);
  };

  const submitCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await createWorkspaceKeyAction(workspaceId, name);
    setIsSubmitting(false);

    if (result.success) {
      setCreatedData({
        rawKey: result.key.rawKey,
      });
      setStep(2);
    } else {
      setError(result.error || 'Failed to create key');
    }
  };

  const copyKey = () => {
    if (!createdData) return;
    navigator.clipboard.writeText(createdData.rawKey).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    });
  };

  const handleRevoke = (id: number) => {
    setRevokeKeyId(id);
  };

  const confirmRevoke = async () => {
    if (revokeKeyId === null) return;
    setIsRevoking(true);
    await revokeWorkspaceKeyAction(revokeKeyId);
    setIsRevoking(false);
    setRevokeKeyId(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="PERSONAL ACCESS TOKENS" />
          </div>
          <div className="page-sub">Manage programmatic access to this workspace</div>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          + Create key
        </button>
      </div>

      <div className="section">
        <div className="panel">
          {keys.map((k) => (
            <div
              key={k.id}
              className="row"
              style={{ gridTemplateColumns: '1.5fr 1fr 1fr auto', alignItems: 'center' }}
            >
              <div className="c-strong">{k.name}</div>
              <div className="c-secondary mono">{k.key_prefix}</div>
              <div className="c-secondary">
                {k.last_used_at
                  ? `Last used ${new Date(k.last_used_at).toLocaleDateString()}`
                  : 'Never used'}
              </div>
              <div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  onClick={() => handleRevoke(k.id)}
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
          {keys.length === 0 && (
            <div className="row" style={{ padding: '16px' }}>
              <span className="c-secondary">
                No personal access tokens generated.<span className="cursor-blink"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="section" style={{ marginTop: '32px' }}>
        <div className="section-head">
          <div className="section-title">How to use Personal Access Tokens</div>
        </div>
        <div className="panel" style={{ padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            Personal Access Tokens allow you to authenticate with the Relay Management API. Pass the token in the <code>Authorization</code> header as a Bearer token.
          </p>
          <div style={{ background: '#000', padding: '16px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="c-secondary mono" style={{ fontSize: '12px', textTransform: 'uppercase' }}>cURL Example</span>
            </div>
            <pre className="mono" style={{ color: 'var(--green)', margin: 0, whiteSpace: 'pre-wrap', fontSize: '13px' }}>
              curl -H "Authorization: Bearer relay_ws_YOUR_TOKEN" \<br/>
              &nbsp;&nbsp;https://your-relay-api-url.com/apis
            </pre>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        title={step === 1 ? 'Create Workspace Key' : 'Key created'}
      >
        {step === 1 && (
          <form onSubmit={submitCreateKey}>
            <div className="modal-body">
              <div className="field">
                <label>Key name</label>
                <input
                  type="text"
                  placeholder="e.g. CI/CD Script"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="modal-warning" style={{ marginTop: '16px' }}>
                <span>⚠</span>
                <span>
                  Personal access tokens have full administrative access to your workspace. Treat them like
                  passwords.
                </span>
              </div>
              {error && (
                <div
                  className="modal-warning"
                  style={{
                    marginTop: '16px',
                    color: 'var(--red-400)',
                    borderColor: 'var(--red-900)',
                  }}
                >
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !name}>
                {isSubmitting ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="modal-body">
              <div className="modal-success-line">
                <span className="dot green"></span>
                <span>{name}</span>
                <span className="tag">Workspace Admin</span>
              </div>
              <div className="modal-kv-panel">
                <div className="modal-kv-row">
                  <span className="k">SECRET KEY</span>
                  <span className="v">
                    <Typewriter text={createdData?.rawKey || ''} />
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary modal-copy-btn"
                    onClick={copyKey}
                  >
                    {copyText}
                  </button>
                </div>
              </div>
              <div className="modal-warning">
                <span>⚠</span>
                <span>
                  This key is shown only once. Store it securely — you won't be able to view it
                  again.
                </span>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={revokeKeyId !== null}
        onClose={() => setRevokeKeyId(null)}
        onConfirm={confirmRevoke}
        title="Revoke Token"
        message="Are you sure you want to revoke this personal access token? Any scripts using it will immediately fail."
        confirmText="Revoke"
        isDestructive={true}
        isLoading={isRevoking}
      />
    </>
  );
}
