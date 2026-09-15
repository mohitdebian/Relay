'use client';
import { NewApiModal } from '@/app/components/modals/NewApiModal';
import { ConfirmModal } from '@/app/components/modals/ConfirmModal';
import Typewriter from '@/app/components/Typewriter';
import LocalTime from '@/app/components/LocalTime';
import TestConsole from '@/app/components/TestConsole';

import { FilterDropdown } from '@/app/components/FilterDropdown';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Drawer from '../../../components/Drawer';
import { deleteApiAction, updateApiAction, revealApiKeyAction } from '../../../actions/api';

export default function ApiDetailClient({
  api,
  keys,
  analytics,
  logs = [],
}: {
  api: any;
  keys: any[];
  analytics: any;
  logs?: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Logs state
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return (logs || []).filter((log) => {
      // Method Filter
      if (methodFilter !== 'all' && log.method.toUpperCase() !== methodFilter.toUpperCase())
        return false;

      // Status Filter
      if (statusFilter !== 'all') {
        const isSuccess = log.status >= 200 && log.status < 300;
        if (statusFilter === 'success' && !isSuccess) return false;
        if (statusFilter === 'error' && isSuccess) return false;
      }

      return true;
    });
  }, [logs, methodFilter, statusFilter]);

  const methodOptions = [
    { label: 'All Methods', value: 'all' },
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Success (2xx)', value: 'success' },
    { label: 'Error (4xx/5xx)', value: 'error' },
  ];

  // Settings state
  const [name, setName] = useState(api.name);
  const [baseUrl, setBaseUrl] = useState(api.upstream_url);
  const [description, setDescription] = useState(api.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteApiAction(api.id);
    if (res.success) {
      router.push('/apis');
    } else {
      setDeleteError(res.error || 'Failed to delete API');
      console.error(res.error || 'Failed to delete API');
      setIsDeleting(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaved(false);
    const res = await updateApiAction(api.id, {
      name,
      upstream_url: baseUrl,
      description,
    });

    if (res.success) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } else {
      console.error(res.error || 'Failed to update API');
    }
    setIsSaving(false);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLog, setDrawerLog] = useState<any>(null);

  const traffic = {
    bars: analytics?.timeseries?.map((t: any) => t.requests) || [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    requests: analytics?.overview?.totalRequests || '0',
    errors: analytics?.overview?.totalErrors || '0',
    latency: `${analytics?.overview?.averageLatencyMs || 0}ms`,
  };

  const maxBar = Math.max(...traffic.bars, 1);
  const peakIdx = traffic.bars.indexOf(maxBar);

  const detail = {
    sub: `REST · v1`,
    status: api.status?.toLowerCase() === 'degraded' ? 'Degraded' : 'Healthy',
    color: api.status?.toLowerCase() === 'degraded' ? 'var(--yellow)' : 'var(--green)',
  };

  const settings = {
    baseUrl: api.upstream_url,
    description: api.description || '',
  };

  return (
    <>
      <div className="breadcrumb">
        <Link href="/apis" className="crumb-link">
          APIs
        </Link>
        <span className="sep">/</span>
        <span className="current">{api.name}</span>
      </div>

      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text={api.name} /> <span className="tag">{api.environment}</span>
          </div>
          <div
            className="page-sub"
            dangerouslySetInnerHTML={{
              __html: `${detail.sub} &middot; <span style="color:${detail.color}; font-weight:500;">${detail.status}</span>`,
            }}
          ></div>
        </div>
      </div>

      <div className="tabs">
        {['overview', 'endpoints', 'traffic', 'logs', 'keys', 'test', 'settings'].map((tab) => (
          <div
            key={tab}
            className={`tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stat-row">
            <div className="stat">
              <div className="stat-label">Request volume (24h)</div>
              <div className="stat-value">{traffic.requests}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Success rate</div>
              <div
                className={`stat-value ${parseInt(traffic.requests.toString(), 10) === 0 ? '' : parseInt(traffic.requests.toString(), 10) > 0 && parseInt(traffic.errors.toString(), 10) / parseInt(traffic.requests.toString(), 10) > 0.05 ? 'yellow' : 'green'}`}
              >
                {parseInt(traffic.requests.toString(), 10) > 0
                  ? `${Math.round(((parseInt(traffic.requests.toString(), 10) - parseInt(traffic.errors.toString(), 10)) / parseInt(traffic.requests.toString(), 10)) * 100)}%`
                  : '---'}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Avg latency</div>
              <div className="stat-value">{traffic.latency}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Errors (24h)</div>
              <div className="stat-value">{traffic.errors}</div>
            </div>
          </div>

          <div className="section">
            <div className="section-title" style={{ marginBottom: '10px' }}>
              Gateway URL
            </div>
            <div className="panel" style={{ padding: '14px 16px' }}>
              <div className="c-secondary" style={{ marginBottom: '12px' }}>
                Base URL for routing requests through Relay to your API.
              </div>
              <div
                className="mono"
                style={{
                  background: 'var(--bg-card)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    opacity: 0.9,
                  }}
                >
                  {(
                    process.env.NEXT_PUBLIC_GATEWAY_URL ||
                    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
                      ? 'https://your-gateway.com'
                      : 'http://127.0.0.1:8080')
                  ).replace(/\/$/, '')}
                  /{api.slug}
                </div>
                <button
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    marginLeft: '12px',
                    flexShrink: 0,
                  }}
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    const url = `${(process.env.NEXT_PUBLIC_GATEWAY_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://your-gateway.com' : 'http://127.0.0.1:8080')).replace(/\/$/, '')}/${api.slug}`;
                    navigator.clipboard.writeText(url);
                    const originalText = btn.innerText;
                    btn.innerText = 'Copied!';
                    setTimeout(() => {
                      btn.innerText = originalText;
                    }, 2000);
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div className="section">
            <div className="section-head">
              <div className="section-title">Endpoints</div>
              <div className="section-link" onClick={() => setActiveTab('endpoints')}>
                View all
              </div>
            </div>
            <div className="panel" style={{ padding: '14px 16px' }}>
              {(!analytics?.endpoints || analytics.endpoints.length === 0) && (
                <div className="row" style={{ padding: 0 }}>
                  <span className="c-secondary">
                    No endpoints discovered from traffic yet.<span className="cursor-blink"></span>
                  </span>
                </div>
              )}
              {analytics?.endpoints?.slice(0, 3).map((ep: any, i: number) => {
                const isLast = i === Math.min(analytics.endpoints.length, 3) - 1;
                return (
                  <div
                    key={i}
                    className="row log-row"
                    style={{
                      gridTemplateColumns: '80px 1fr 100px',
                      padding: '10px 0',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                    <span
                      className="mono"
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {ep.path}
                    </span>
                    <span className="c-secondary c-right mono">{ep.requests} reqs</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'endpoints' && (
        <div className="panel" style={{ padding: '14px 16px' }}>
          {(!analytics?.endpoints || analytics.endpoints.length === 0) && (
            <div className="row" style={{ padding: 0 }}>
              <span className="c-secondary">
                No endpoints discovered from traffic yet.<span className="cursor-blink"></span>
              </span>
            </div>
          )}
          {analytics?.endpoints?.map((ep: any, i: number) => {
            const isLast = i === analytics.endpoints.length - 1;
            return (
              <div
                key={i}
                className="row log-row"
                style={{
                  gridTemplateColumns: '80px 1fr 100px 100px 100px',
                  padding: '10px 0',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                }}
              >
                <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                <span
                  className="mono"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {ep.path}
                </span>
                <span className="c-secondary c-right mono">{ep.requests} reqs</span>
                <span
                  className={`c-right mono`}
                  style={{ color: ep.errors > 0 ? 'var(--red)' : 'var(--text-secondary)' }}
                >
                  {ep.errors} errs
                </span>
                <span className="c-secondary c-right mono">{ep.latency}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'traffic' && (
        <div className="panel">
          <div className="bars">
            {traffic.bars.map((v: number, i: number) => (
              <div
                key={i}
                className={`bar${i === peakIdx ? ' peak' : ''}`}
                style={{ height: `${(v / maxBar) * 100}%` }}
              ></div>
            ))}
          </div>
          <div className="bars-axis">
            <span>-24h</span>
            <span>-18h</span>
            <span>-12h</span>
            <span>-6h</span>
            <span>Now</span>
          </div>
          <div style={{ display: 'flex', padding: '14px 16px' }}>
            <div style={{ flex: 1 }}>
              <div className="c-label">REQUESTS</div>
              <div className="c-mono" style={{ fontSize: '15px' }}>
                {traffic.requests}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="c-label">ERRORS</div>
              <div className="c-mono" style={{ fontSize: '15px', color: 'var(--red)' }}>
                {traffic.errors}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="c-label">AVG LATENCY</div>
              <div className="c-mono" style={{ fontSize: '15px' }}>
                {traffic.latency}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <>
          <div className="page-sub" style={{ marginBottom: '14px' }}>
            Showing requests to <span className="c-mono">{api.name}</span> only.
          </div>
          <div className="filter-bar" style={{ marginBottom: '16px' }}>
            <FilterDropdown
              label="Method"
              value={methodFilter}
              onChange={setMethodFilter}
              options={methodOptions}
            />
            <FilterDropdown
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </div>
          <div className="panel">
            <div className="row row-head" style={{ gridTemplateColumns: '100px 70px 1.6fr 70px 70px' }}>
              <div>TIME</div>
              <div>METHOD</div>
              <div>PATH</div>
              <div className="c-right">STATUS</div>
              <div className="c-right">LATENCY</div>
            </div>

            {filteredLogs.length === 0 && (
              <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                No logs found matching filters.
              </div>
            )}

            {filteredLogs.map((log, i) => (
              <div
                key={i}
                className="row log-row"
                style={{ gridTemplateColumns: '100px 70px 1.6fr 70px 70px', cursor: 'pointer' }}
                onClick={() => {
                  setDrawerLog(log);
                  setDrawerOpen(true);
                }}
              >
                <span className="c-secondary mono"><LocalTime time={log.time} /></span>
                <span className={`method ${log.method.toLowerCase()}`}>{log.method}</span>
                <span
                  className="mono"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {log.path}
                </span>
                <span className={`mono c-right ${log.status >= 400 ? 'status failing' : 'status ok'}`}>
                  {log.status}
                </span>
                <span className="mono c-secondary c-right">{log.latency}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'keys' && (
        <div className="panel" style={{ padding: '14px 16px' }}>
          {keys.map((k: any, i: number) => (
            <div
              key={i}
              className="row"
              style={{
                gridTemplateColumns: '1fr auto auto',
                padding: '10px 0',
                borderBottom: i === keys.length - 1 ? 'none' : '1px solid var(--border)',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div>
                <div className="c-strong">{k.name}</div>
                <div className="c-secondary mono" style={{ fontSize: '12px' }}>{k.key_prefix}</div>
              </div>
              <div className="c-secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                {new Date(k.created_at).toLocaleDateString()}
              </div>
              <CopyKeyButton apiId={api.id} keyId={k.id} />
            </div>
          ))}
          {keys.length === 0 && (
            <div className="row" style={{ padding: 0 }}>
              <span className="c-secondary">
                No keys scoped to this API yet.<span className="cursor-blink"></span>
              </span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'test' && (
        <TestConsole apiSlug={api.slug} keys={keys} />
      )}

      {activeTab === 'settings' && (
        <>
          <div className="field">
            <label>API name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="mono"
            />
          </div>
          <div className="field">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: '4px' }}
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving changes...' : saved ? 'Saved!' : 'Save changes'}
          </button>

          <div className="section" style={{ marginTop: '36px' }}>
            <div className="section-title" style={{ marginBottom: '10px' }}>
              Backend Verification
            </div>
            <div className="panel" style={{ padding: '14px 16px' }}>
              <div className="c-strong" style={{ marginBottom: '4px' }}>
                Shared Secret
              </div>
              <div className="c-secondary" style={{ marginBottom: '12px' }}>
                Use this secret to verify that incoming requests are proxied by Relay. Relay will
                inject the <code>X-Relay-Signature</code> header into every request sent to your
                upstream URL.
              </div>
              <div
                className="mono"
                style={{
                  background: 'var(--bg-card)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  {api.shared_secret || 'Not generated yet (API created before feature was added)'}
                </span>
                {api.shared_secret && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    onClick={() => {
                      navigator.clipboard.writeText(api.shared_secret);
                      // In a real app, you'd show a toast here
                    }}
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="section" style={{ marginTop: '36px' }}>
            <div className="section-title" style={{ color: 'var(--red)', marginBottom: '10px' }}>
              Danger zone
            </div>
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
                <div className="c-strong">Delete this API</div>
                <div className="c-secondary">
                  Removes all endpoints, keys and logs. This cannot be undone.
                </div>
              </div>
              <button
                className="btn btn-danger"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(true)}
              >
                {isDeleting ? 'Deleting...' : 'Delete API'}
              </button>
            </div>
          </div>

          <ConfirmModal
            open={showDeleteConfirm}
            onClose={() => {
              setShowDeleteConfirm(false);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            title="Delete API"
            message="Are you sure you want to delete this API? This will permanently remove all endpoints, keys, and logs. This action cannot be undone."
            confirmText="Delete"
            isDestructive={true}
            isLoading={isDeleting}
            error={deleteError}
          />
        </>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} log={drawerLog} />
    </>
  );
}

function CopyKeyButton({ apiId, keyId }: { apiId: number; keyId: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopy = async () => {
    setState('loading');
    setErrorMsg('');
    const res = await revealApiKeyAction(apiId, keyId);
    if (res.success && res.rawKey) {
      await navigator.clipboard.writeText(res.rawKey);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } else {
      setErrorMsg(res.error || 'Failed to copy');
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <button
      className="btn btn-secondary"
      style={{ padding: '4px 10px', fontSize: '11px', height: 'auto', whiteSpace: 'nowrap', minWidth: '56px' }}
      onClick={handleCopy}
      disabled={state === 'loading'}
      title={state === 'error' ? errorMsg : 'Copy API key to clipboard'}
    >
      {state === 'idle' && '⎘ Copy'}
      {state === 'loading' && '...'}
      {state === 'copied' && '✓ Copied'}
      {state === 'error' && '✗ Error'}
    </button>
  );
}

