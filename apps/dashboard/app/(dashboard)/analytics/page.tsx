import Typewriter from '@/app/components/Typewriter';
const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import { getWorkspaceAnalyticsAction } from '@/app/actions/analytics';

export default async function AnalyticsPage() {
  const { analytics } = await getWorkspaceAnalyticsAction().catch((e) => {
    if (isRedirectError(e)) throw e;
    return { analytics: null };
  });

  const totalRequests = analytics?.overview?.totalRequests || 0;
  const successRate =
    totalRequests === 0
      ? 'N/A'
      : (((totalRequests - (analytics?.overview?.totalErrors || 0)) / totalRequests) * 100).toFixed(
          2
        ) + '%';
  const avgLatency = analytics?.overview?.averageLatencyMs || 0;
  const byEndpoint = analytics?.byEndpoint || [];
  const byKey = analytics?.byKey || [];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="ANALYTICS" />
          </div>
          <div className="page-sub">All time (Workspace Overview)</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-chip">
          API <span className="chev">▾</span>
        </div>
        <div className="filter-chip">
          API Key <span className="chev">▾</span>
        </div>
        <div className="filter-chip">
          Endpoint <span className="chev">▾</span>
        </div>
        <div className="filter-chip">
          Environment <span className="chev">▾</span>
        </div>
        <div className="filter-chip">
          Status <span className="chev">▾</span>
        </div>
        <div className="filter-chip">
          All Time <span className="chev">▾</span>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Requests</div>
          <div className="stat-value">{totalRequests}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Success Rate</div>
          <div className="stat-value green">{successRate}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg latency</div>
          <div className="stat-value">{avgLatency}ms</div>
        </div>
        <div className="stat">
          <div className="stat-label">Usage cost</div>
          <div className="stat-value">$0.00</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">By endpoint</div>
        </div>
        <div className="panel">
          {(!byEndpoint || byEndpoint.length === 0) && (
            <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
              No traffic recorded yet.<span className="cursor-blink"></span>
            </div>
          )}
          {byEndpoint.map((e: any) => (
            <div
              key={e.path}
              className="row"
              style={{ gridTemplateColumns: '1.6fr .8fr .8fr .8fr' }}
            >
              <span className="mono">{e.path}</span>
              <span className="c-mono">{e.requests} requests</span>
              <span
                className="c-mono"
                style={{ color: e.errors > 0 ? 'var(--red)' : 'var(--text)' }}
              >
                {e.errors} errors
              </span>
              <span className="c-mono c-right">{e.latency}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">By API key</div>
        </div>
        <div className="panel">
          {(!byKey || byKey.length === 0) && (
            <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
              No API keys used yet.<span className="cursor-blink"></span>
            </div>
          )}
          {byKey.map((k: any) => (
            <div key={k.name} className="row" style={{ gridTemplateColumns: '1.6fr .8fr .8fr' }}>
              <span className="c-strong">{k.name}</span>
              <span className="c-mono">{k.requests} requests</span>
              <span className="c-mono c-right">{k.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
