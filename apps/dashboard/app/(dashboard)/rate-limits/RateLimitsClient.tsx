'use client';

import { useState } from 'react';
import { updateApiAction } from '@/app/actions/api';

interface Api {
  id: number;
  name: string;
  slug: string;
  rate_limit_enabled: boolean;
  rate_limit_max: number;
  rate_limit_window: number;
  environment: string;
}

export default function RateLimitsClient({ initialApis }: { initialApis: Api[] }) {
  const [apis, setApis] = useState<Api[]>(initialApis);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  const handleUpdate = (apiId: number, field: keyof Api, value: any) => {
    setApis(apis.map((api) => (api.id === apiId ? { ...api, [field]: value } : api)));
    if (errorId === apiId) setErrorId(null);
  };

  const handleSave = async (api: Api) => {
    setSavingId(api.id);
    setErrorId(null);
    const result = await updateApiAction(api.id, {
      rate_limit_enabled: api.rate_limit_enabled,
      rate_limit_max: Number(api.rate_limit_max),
      rate_limit_window: Number(api.rate_limit_window),
    });
    setSavingId(null);
    if (!result.success) {
      console.error(`Failed to save: ${result.error}`);
      setErrorId(api.id);
    }
  };

  return (
    <div className="rate-limits-container">
      {apis.map((api) => (
        <div key={api.id} className="panel api-limit-card" style={{ marginBottom: '24px' }}>
          <div
            className="api-limit-header"
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{api.name}</h3>
                <span className="badge">{api.environment}</span>
              </div>
              <div className="mono c-secondary">{api.slug}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className={`status ${api.rate_limit_enabled ? 'healthy' : 'disabled'}`}>
                {api.rate_limit_enabled ? 'Active' : 'Disabled'}
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={api.rate_limit_enabled}
                  onChange={(e) => handleUpdate(api.id, 'rate_limit_enabled', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div
            className="api-limit-body"
            style={{
              padding: '24px',
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              opacity: api.rate_limit_enabled ? 1 : 0.5,
              pointerEvents: api.rate_limit_enabled ? 'auto' : 'none',
              transition: 'opacity 0.2s ease',
            }}
          >
            <div
              className="field"
              style={{ flex: '1', minWidth: '200px', maxWidth: 'none', marginBottom: 0 }}
            >
              <label>Max Requests</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="1"
                  value={api.rate_limit_max}
                  onChange={(e) => handleUpdate(api.id, 'rate_limit_max', e.target.value)}
                  placeholder="e.g. 100"
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    fontSize: '13px',
                  }}
                >
                  reqs
                </span>
              </div>
              <div className="hint">Maximum requests allowed within the time window.</div>
            </div>

            <div
              className="field"
              style={{ flex: '1', minWidth: '200px', maxWidth: 'none', marginBottom: 0 }}
            >
              <label>Time Window</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="1"
                  value={api.rate_limit_window}
                  onChange={(e) => handleUpdate(api.id, 'rate_limit_window', e.target.value)}
                  placeholder="e.g. 60"
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    fontSize: '13px',
                  }}
                >
                  secs
                </span>
              </div>
              <div className="hint">Duration in seconds for the rate limit window.</div>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '22px', gap: '12px' }}
            >
              <button
                className="btn btn-primary"
                style={{ height: '32px' }}
                onClick={() => handleSave(api)}
                disabled={savingId === api.id}
              >
                {savingId === api.id ? 'Saving...' : 'Save Configuration'}
              </button>
              {errorId === api.id && (
                <div style={{ color: 'var(--red)', fontSize: '13px', paddingTop: '8px' }}>
                  Failed to save. Please try again.
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {apis.length === 0 && (
        <div
          className="panel"
          style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}
        >
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎛️</div>
          <h3
            style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}
          >
            No APIs configured
          </h3>
          <p>Get started by creating a new API in your workspace to manage its rate limits.</p>
        </div>
      )}
    </div>
  );
}
