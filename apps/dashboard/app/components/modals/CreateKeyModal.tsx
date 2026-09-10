'use client';

import { useState, useEffect } from 'react';
import Typewriter from '../Typewriter';
import Modal from '../Modal';
import { Dropdown } from '../Dropdown';
import { getApisAction, createApiKeyAction } from '@/app/actions/api';

interface CreateKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateKeyModal({ open, onClose }: CreateKeyModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [apiId, setApiId] = useState('');
  const [env, setEnv] = useState('Production');
  const [copyText, setCopyText] = useState('Copy');
  const [apis, setApis] = useState<{ id: number; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdData, setCreatedData] = useState<{ rawKey: string; apiName: string } | null>(null);

  useEffect(() => {
    if (open) {
      getApisAction().then((res) => {
        if (res.success && res.apis.length > 0) {
          setApis(res.apis);
          setApiId(res.apis[0].id.toString());
        }
      });
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setName('');
      setEnv('Production');
      setCopyText('Copy');
      setError('');
      setIsSubmitting(false);
      setCreatedData(null);
    }, 200);
  };

  const submitCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiId) return setError('Please select an API first.');

    setIsSubmitting(true);
    setError('');

    const result = await createApiKeyAction(parseInt(apiId), name, env);
    setIsSubmitting(false);

    if (result.success) {
      const selectedApi = apis.find((a) => a.id.toString() === apiId);
      setCreatedData({
        rawKey: result.key.rawKey,
        apiName: selectedApi?.name || 'API',
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

  return (
    <Modal open={open} onClose={handleClose} title={step === 1 ? 'Create API Key' : 'Key created'}>
      {step === 1 && (
        <form onSubmit={submitCreateKey}>
          <div className="modal-body">
            <div className="field">
              <label>Key name</label>
              <input
                type="text"
                placeholder="e.g. Marketing Site"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Scoped API</label>
              <Dropdown
                value={apiId}
                onChange={setApiId}
                options={
                  apis.length > 0
                    ? apis.map((api) => ({ label: api.name, value: api.id.toString() }))
                    : [{ label: 'No APIs found...', value: '' }]
                }
                disabled={apis.length === 0}
              />
            </div>
            <div className="field">
              <label>Environment</label>
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
            {error && (
              <div className="modal-warning" style={{ marginTop: '16px' }}>
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || apis.length === 0}
            >
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
              <span>{name || 'Marketing Site'} Key</span>
              <span className="tag">{env}</span>
            </div>
            <div className="modal-kv-panel">
              <div className="modal-kv-row">
                <span className="k">SCOPED TO</span>
                <span className="v">{createdData?.apiName || 'API'}</span>
              </div>
              <div className="modal-kv-row">
                <span className="k">API KEY</span>
                <span className="v">
                  <Typewriter text={createdData?.rawKey || 'rly_live_••••••••••••6f2a'} />
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
                This key is shown only once. Store it securely — you won't be able to view it again.
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
  );
}

export function CreateKeyButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + Create key
      </button>
      <CreateKeyModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
