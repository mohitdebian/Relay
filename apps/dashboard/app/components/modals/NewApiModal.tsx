'use client';

import { useState } from 'react';
import Typewriter from '../Typewriter';
import Modal from '../Modal';

interface NewApiModalProps {
  open: boolean;
  onClose: () => void;
}

import { Dropdown } from '../Dropdown';
import { createApiAction } from '@/app/actions/api';

export function NewApiModal({ open, onClose }: NewApiModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [apiType, setApiType] = useState('REST');
  const [env, setEnv] = useState('production');
  const [upstreamUrl, setUpstreamUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [copyText, setCopyText] = useState('Copy');
  const [copyUrlText, setCopyUrlText] = useState('Copy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdData, setCreatedData] = useState<{
    slug: string;
    rawKey: string;
    keyPrefix: string;
  } | null>(null);

  // Reset state when opening/closing
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setName('');
      setUpstreamUrl('');
      setApiType('REST');
      setEnv('production');
      setDesc('');
      setCopyText('Copy');
      setCopyUrlText('Copy');
      setError('');
      setIsSubmitting(false);
      setCreatedData(null);
    }, 200); // Wait for transition
  };

  const submitNewApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await createApiAction(name, env, desc, upstreamUrl || 'https://example.com');

    setIsSubmitting(false);
    if (result.success) {
      setCreatedData({
        slug: result.api.slug,
        rawKey: result.key.rawKey,
        keyPrefix: result.key.apiKey.key_prefix,
      });
      setStep(2);
    } else {
      setError(result.error || 'Failed to create API');
    }
  };

  const copyNewApiKey = () => {
    if (!createdData) return;
    navigator.clipboard.writeText(createdData.rawKey).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    });
  };

  const slugifiedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'orders-api';

  return (
    <Modal open={open} onClose={handleClose} title={step === 1 ? 'New API' : 'API created'}>
      {step === 1 && (
        <form onSubmit={submitNewApi} data-testid="new-api-form">
          <div className="modal-body">
            <div className="field">
              <label>API name</label>
              <input
                type="text"
                placeholder="Orders API"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="api-name-input"
              />
            </div>
            <div className="field">
              <label>Target URL</label>
              <input
                type="url"
                placeholder="https://api.yourdomain.com"
                required
                value={upstreamUrl}
                onChange={(e) => setUpstreamUrl(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Type</label>
              <Dropdown
                value={apiType}
                onChange={setApiType}
                options={[
                  { label: 'REST', value: 'REST' },
                  { label: 'GraphQL', value: 'GraphQL' },
                  { label: 'gRPC', value: 'gRPC' },
                  { label: 'WebSocket', value: 'WebSocket' },
                ]}
              />
            </div>
            <div className="field">
              <label>Environment</label>
              <Dropdown
                value={env}
                onChange={setEnv}
                options={[
                  { label: 'Production', value: 'production' },
                  { label: 'Staging', value: 'staging' },
                  { label: 'Development', value: 'development' },
                ]}
              />
            </div>
            <div className="field">
              <label>
                Description{' '}
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                placeholder="What this API is for"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
              <div className="hint">Shown on the API's overview page.</div>
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
              data-testid="create-api-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create API'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div data-testid="new-api-success">
          <div className="modal-body">
            <div className="modal-success-line">
              <span className="dot green"></span>
              <span>{name || 'Orders API'}</span>
              <span className="tag">{env}</span>
            </div>
            <div className="modal-kv-panel">
              <div className="modal-kv-row">
                <span className="k">BASE URL</span>
                <span
                  className="v"
                  title={`${(process.env.NEXT_PUBLIC_GATEWAY_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://your-gateway.com' : 'http://127.0.0.1:8080')).replace(/\/$/, '')}/${createdData?.slug || 'api'}`}
                >
                  <Typewriter text={`${(process.env.NEXT_PUBLIC_GATEWAY_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://your-gateway.com' : 'http://127.0.0.1:8080')).replace(/\/$/, '')}/${createdData?.slug || 'api'}`} />
                </span>
                <button
                  type="button"
                  className="btn btn-secondary modal-copy-btn"
                  onClick={() => {
                    if (!createdData) return;
                    const url = `${(process.env.NEXT_PUBLIC_GATEWAY_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://your-gateway.com' : 'http://127.0.0.1:8080')).replace(/\/$/, '')}/${createdData.slug}`;
                    navigator.clipboard.writeText(url).then(() => {
                      setCopyUrlText('Copied!');
                      setTimeout(() => setCopyUrlText('Copy'), 2000);
                    });
                  }}
                >
                  {copyUrlText}
                </button>
              </div>
              <div className="modal-kv-row">
                <span className="k">API KEY</span>
                <span className="v">
                  <Typewriter
                    text={createdData?.rawKey || 'rly_live_••••••••••••4f2a'}
                    delay={400}
                  />
                </span>
                <button
                  type="button"
                  className="btn btn-secondary modal-copy-btn"
                  onClick={copyNewApiKey}
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleClose}
              data-testid="done-btn"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function NewApiButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + New API
      </button>
      <NewApiModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
