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

  const handleUpdate = (apiId: number, field: keyof Api, value: any) => {
    setApis(apis.map(api => api.id === apiId ? { ...api, [field]: value } : api));
  };

  const handleSave = async (api: Api) => {
    setSavingId(api.id);
    const result = await updateApiAction(api.id, {
      rate_limit_enabled: api.rate_limit_enabled,
      rate_limit_max: Number(api.rate_limit_max),
      rate_limit_window: Number(api.rate_limit_window),
    });
    setSavingId(null);
    if (!result.success) {
      alert(`Failed to save: ${result.error}`);
    }
  };

  return (
    <div className="section">
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
        {apis.map(api => (
          <div key={api.id} style={{ background: 'var(--bg-panel)', padding: '24px' }}>
            <div className="row" style={{ alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div className="c-strong" style={{ fontSize: '16px' }}>{api.name}</div>
                <div className="c-secondary mono" style={{ fontSize: '12px', marginTop: '4px' }}>{api.slug}</div>
              </div>
              <div className="tag">{api.environment}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '24px', alignItems: 'end' }}>
              <div className="field">
                <label>Status</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, textTransform: 'none', color: 'var(--text-primary)' }}>
                    <input 
                      type="checkbox" 
                      checked={api.rate_limit_enabled}
                      onChange={(e) => handleUpdate(api.id, 'rate_limit_enabled', e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    {api.rate_limit_enabled ? 'Enabled' : 'Disabled'}
                  </label>
                </div>
              </div>
              
              <div className="field">
                <label>Max Requests</label>
                <input 
                  type="number" 
                  min="1"
                  disabled={!api.rate_limit_enabled}
                  value={api.rate_limit_max}
                  onChange={(e) => handleUpdate(api.id, 'rate_limit_max', e.target.value)}
                  style={{ opacity: api.rate_limit_enabled ? 1 : 0.5 }}
                />
              </div>

              <div className="field">
                <label>Window (seconds)</label>
                <input 
                  type="number" 
                  min="1"
                  disabled={!api.rate_limit_enabled}
                  value={api.rate_limit_window}
                  onChange={(e) => handleUpdate(api.id, 'rate_limit_window', e.target.value)}
                  style={{ opacity: api.rate_limit_enabled ? 1 : 0.5 }}
                />
              </div>

              <div style={{ paddingBottom: '2px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSave(api)}
                  disabled={savingId === api.id}
                >
                  {savingId === api.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {apis.length === 0 && (
          <div style={{ background: 'var(--bg-panel)', padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No APIs found. Create an API first to configure rate limits.
          </div>
        )}
      </div>
    </div>
  );
}
