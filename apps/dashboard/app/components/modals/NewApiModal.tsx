'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Typewriter from '../Typewriter';
import Modal from '../Modal';

interface NewApiModalProps {
  open: boolean;
  onClose: () => void;
}

import { Dropdown } from '../Dropdown';
import { createApiAction } from '@/app/actions/api';

export function NewApiModal({ open, onClose }: NewApiModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [apiType, setApiType] = useState('REST');
  const [env, setEnv] = useState('production');
  const [upstreamUrl, setUpstreamUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [copyText, setCopyText] = useState('Copy');
  const [copyUrlText, setCopyUrlText] = useState('Copy');
  const [copyCurlText, setCopyCurlText] = useState('Copy');
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
      setCopyCurlText('Copy');
      setError('');
      setIsSubmitting(false);
      setCreatedData(null);
      // Refresh the page data now that the modal has fully animated out
      if (step === 2) {
        router.refresh();
      }
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

  const copyCurlCommand = () => {
    if (!createdData) return;
    const url = `${(process.env.NEXT_PUBLIC_GATEWAY_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://your-gateway.com' : 'http://127.0.0.1:8080')).replace(/\/$/, '')}/${createdData.slug}`;
    const cmd = `curl -H "Authorization: Bearer ${createdData.rawKey}" \\\n${url}`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopyCurlText('Copied!');
      setTimeout(() => setCopyCurlText('Copy'), 2000);
    });
  };

  const slugifiedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'orders-api';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 1 ? 'Create New API' : 'API Created Successfully'}
    >
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
              <label>Target URL (Your existing backend server)</label>
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
          <div className="modal-body" style={{ paddingBottom: '0' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--green-dim)',
                  color: 'var(--green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{name || 'Orders API'}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Environment: {env}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                BASE URL
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '8px 12px',
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {(
                    process.env.NEXT_PUBLIC_GATEWAY_URL ||
                    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
                      ? 'https://your-gateway.com'
                      : 'http://127.0.0.1:8080')
                  ).replace(/\/$/, '')}
                  /{createdData?.slug || 'api'}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    height: 'auto',
                    marginLeft: '12px',
                    flexShrink: 0,
                  }}
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
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                API KEY
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '8px 12px',
                }}
              >
                <span className="mono" style={{ fontSize: '13px' }}>
                  <Typewriter
                    text={createdData?.rawKey || 'rly_live_••••••••••••4f2a'}
                    delay={400}
                  />
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    height: 'auto',
                    marginLeft: '12px',
                    flexShrink: 0,
                  }}
                  onClick={copyNewApiKey}
                >
                  {copyText}
                </button>
              </div>
            </div>

            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-app)',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.5px',
                  }}
                >
                  TEST YOUR API
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '12px', height: 'auto' }}
                  onClick={copyCurlCommand}
                >
                  {copyCurlText}
                </button>
              </div>
              <div
                className="mono"
                style={{
                  padding: '16px',
                  background: '#fafafa',
                  color: '#333',
                  borderTop: '1px solid #fff',
                  fontSize: '12.5px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: '#005cc5' }}>curl</span> -H{' '}
                <span style={{ color: '#d73a49' }}>
                  "Authorization: Bearer {createdData?.rawKey || 'YOUR_KEY'}"
                </span>{' '}
                \<br />
                <span style={{ color: '#22863a' }}>
                  {(
                    process.env.NEXT_PUBLIC_GATEWAY_URL ||
                    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
                      ? 'https://your-gateway.com'
                      : 'http://127.0.0.1:8080')
                  ).replace(/\/$/, '')}
                  /{createdData?.slug || 'api'}
                </span>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleClose}
              data-testid="done-btn"
            >
              Go to Dashboard
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
