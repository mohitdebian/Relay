'use client';

import { useState } from 'react';
import Typewriter from '@/app/components/Typewriter';
import { Dropdown } from '@/app/components/Dropdown';
import Modal from '@/app/components/Modal';
import {
  updateWorkspaceAction,
  deleteWorkspaceAction,
  deleteAccountAction,
} from '@/app/actions/workspace';

interface Workspace {
  id: number;
  name: string;
  slug: string;
}

export default function SettingsForm({ workspace }: { workspace: Workspace | null }) {
  const [env, setEnv] = useState('Production');
  const [timezone, setTimezone] = useState('UTC');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [wsConfirmText, setWsConfirmText] = useState('');
  const wsRequiredText = `delete my ${workspace?.name || 'workspace'} workspace`;

  const [accModalOpen, setAccModalOpen] = useState(false);
  const [accConfirmText, setAccConfirmText] = useState('');
  const accRequiredText = 'delete my account';

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspace) return;

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateWorkspaceAction(workspace.id.toString(), formData);

    setIsSaving(false);
    if (result?.error) {
      setSaveError(result.error);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="GENERAL" />
          </div>
          <div className="page-sub">Workspace settings</div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="field">
          <label>Workspace name</label>
          <input type="text" name="name" defaultValue={workspace?.name || 'Acme Inc.'} required />
        </div>

        <div className="field">
          <label>Workspace slug</label>
          <input
            type="text"
            name="slug"
            defaultValue={workspace?.slug || 'acme-workspace'}
            className="mono"
            required
          />
          <div className="hint">relay.dev/{workspace?.slug || 'acme-workspace'}</div>
        </div>

        <div className="field">
          <label>Default environment</label>
          <Dropdown
            value={env}
            onChange={setEnv}
            options={[
              { label: 'Production', value: 'Production' },
              { label: 'Staging', value: 'Staging' },
              { label: 'Development', value: 'Development' },
            ]}
          />
        </div>

        <div className="field">
          <label>Timezone</label>
          <Dropdown
            value={timezone}
            onChange={setTimezone}
            options={[
              { label: 'UTC', value: 'UTC' },
              { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
              { label: 'America/New_York', value: 'America/New_York' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
          {saveSuccess && (
            <span style={{ color: 'var(--green)', fontSize: '13px' }}>
              Settings saved successfully!
            </span>
          )}
          {saveError && <span style={{ color: 'var(--red)', fontSize: '13px' }}>{saveError}</span>}
        </div>
      </form>

      <div className="section" style={{ marginTop: '36px' }}>
        <div className="section-title" style={{ color: 'var(--red)', marginBottom: '10px' }}>
          Danger zone
        </div>

        {/* Workspace Deletion */}
        <div
          className="panel"
          style={{
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div>
            <div className="c-strong">Delete this workspace</div>
            <div className="c-secondary">
              Removes all APIs, keys, domains and members permanently.
            </div>
          </div>
          <button className="btn btn-danger" onClick={() => setWsModalOpen(true)}>
            Delete workspace
          </button>
        </div>

        {/* Account Deletion */}
        <div
          className="panel"
          style={{
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="c-strong">Delete my account</div>
            <div className="c-secondary">
              Permanently deletes your account and all workspaces you own.
            </div>
          </div>
          <button className="btn btn-danger" onClick={() => setAccModalOpen(true)}>
            Delete account
          </button>
        </div>
      </div>

      {/* Workspace Deletion Modal */}
      <Modal open={wsModalOpen} onClose={() => setWsModalOpen(false)} title="Delete Workspace">
        <div className="modal-body">
          <div className="modal-warning" style={{ marginBottom: '16px' }}>
            Warning: This action is irreversible. All data, APIs, and logs will be lost.
          </div>
          <div className="field">
            <label>
              To verify, type <strong style={{ color: 'var(--text)' }}>{wsRequiredText}</strong>{' '}
              below:
            </label>
            <input
              type="text"
              value={wsConfirmText}
              onChange={(e) => setWsConfirmText(e.target.value)}
              placeholder={wsRequiredText}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={() => setWsModalOpen(false)}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={wsConfirmText !== wsRequiredText}
            onClick={() => workspace && deleteWorkspaceAction(workspace.id.toString())}
          >
            I understand, delete workspace
          </button>
        </div>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal open={accModalOpen} onClose={() => setAccModalOpen(false)} title="Delete Account">
        <div className="modal-body">
          <div className="modal-warning" style={{ marginBottom: '16px' }}>
            Warning: This action is irreversible. Your account and all workspaces you own will be
            permanently deleted.
          </div>
          <div className="field">
            <label>
              To verify, type <strong style={{ color: 'var(--text)' }}>{accRequiredText}</strong>{' '}
              below:
            </label>
            <input
              type="text"
              value={accConfirmText}
              onChange={(e) => setAccConfirmText(e.target.value)}
              placeholder={accRequiredText}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={() => setAccModalOpen(false)}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={accConfirmText !== accRequiredText}
            onClick={() => deleteAccountAction()}
          >
            I understand, delete my account
          </button>
        </div>
      </Modal>
    </>
  );
}
