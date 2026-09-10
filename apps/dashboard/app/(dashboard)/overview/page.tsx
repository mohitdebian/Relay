const isRedirectError = (e: any) => e && e.digest && e.digest.startsWith('NEXT_REDIRECT');
import Link from 'next/link';
import Typewriter from '@/app/components/Typewriter';
import { fetchAPI } from '@/app/lib/api';
import { getLogsAction } from '@/app/actions/logs';

import { NewApiButton } from '@/app/components/modals/NewApiModal';

export default async function OverviewPage() {
  const data_apis = await fetchAPI('/apis').catch((e) => {
    if (isRedirectError(e)) throw e;
    return { apis: [] };
  });
  const apis = data_apis?.apis || [];

  const data_logs = await getLogsAction().catch((e) => {
    if (isRedirectError(e)) throw e;
    return { logs: [] };
  });
  const logs = data_logs?.logs || [];

  const data_analytics = await fetchAPI('/analytics/overview').catch((e) => {
    if (isRedirectError(e)) throw e;
    return { overview: null };
  });
  const analyticsOverview = data_analytics?.overview;

  let allKeys: any[] = [];
  if (apis.length > 0) {
    const keysPromises = apis.map((api: any) =>
      fetchAPI(`/apis/${api.id}/keys`).catch((e) => {
        if (isRedirectError(e)) throw e;
        return {};
      })
    );
    const keysResults = await Promise.all(keysPromises);
    keysResults.forEach((res) => {
      if (res.keys) allKeys = [...allKeys, ...res.keys];
    });
  }

  const overviewKeys = allKeys.slice(0, 3);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="OVERVIEW" />
          </div>
          <div className="page-sub">{apis.length} APIs · last updated just now</div>
        </div>
        <NewApiButton />
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Requests (24h)</div>
          <div className="stat-value">
            {analyticsOverview ? analyticsOverview.totalRequests : '---'}
          </div>
          <div className="stat-delta">N/A</div>
        </div>
        <div className="stat">
          <div className="stat-label">Success rate</div>
          <div className="stat-value green">
            {analyticsOverview && analyticsOverview.totalRequests > 0
              ? Math.round(
                  ((analyticsOverview.totalRequests - analyticsOverview.totalErrors) /
                    analyticsOverview.totalRequests) *
                    100
                ) + '%'
              : '---'}
          </div>
          <div className="stat-delta">N/A</div>
        </div>
        <div className="stat">
          <div className="stat-label">p95 latency</div>
          <div className="stat-value">
            {analyticsOverview ? analyticsOverview.averageLatencyMs + 'ms' : '---'}
          </div>
          <div className="stat-delta">N/A</div>
        </div>
        <div className="stat">
          <div className="stat-label">Active API keys</div>
          <div className="stat-value">{allKeys.length}</div>
          <div className="stat-delta">across all APIs</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">Your APIs</div>
          <Link href="/apis" className="section-link">
            View all
          </Link>
        </div>
        <div className="panel">
          {apis.length === 0 && (
            <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
              No APIs found. Create one to get started.<span className="cursor-blink"></span>
            </div>
          )}
          {apis.map((api: any) => (
            <Link
              key={api.id}
              href={`/apis/${api.id}`}
              className="row clickable"
              style={{ gridTemplateColumns: '1fr auto' }}
            >
              <div>
                <div className="c-strong">{api.name}</div>
                <div className="c-secondary">
                  REST · v1{' '}
                  <span className="tag" style={{ marginLeft: '6px' }}>
                    {api.environment}
                  </span>
                </div>
              </div>
              <div className={`status ${api.status || 'active'} c-right`}>
                <span
                  className={`dot ${(api.status || 'active') === 'active' ? 'green' : 'yellow'}`}
                ></span>
                {(api.status || 'active') === 'active' ? 'Healthy' : 'Degraded'}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '24px',
        }}
      >
        <div className="section">
          <div className="section-head">
            <div className="section-title">Recent activity</div>
            <Link href="/logs" className="section-link">
              View logs
            </Link>
          </div>
          <div className="panel">
            {(!logs || logs.length === 0) && (
              <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                No logs found.<span className="cursor-blink"></span>
              </div>
            )}
            {logs.slice(0, 5).map((log: any, index: number) => (
              <div key={index} className="row log-row">
                <span className="c-secondary mono">{log.time}</span>
                <span className={`method ${log.method.toLowerCase()}`}>{log.method}</span>
                <span
                  className="mono"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {log.path}
                </span>
                <span
                  className="mono c-right"
                  style={{
                    color: log.status < 400 ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {log.status}
                </span>
                <span className="mono c-secondary c-right">{log.latency}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">API keys</div>
            <Link href="/keys" className="section-link">
              Manage
            </Link>
          </div>
          <div className="panel" style={{ padding: '14px 16px' }}>
            {overviewKeys.length === 0 && (
              <div className="row" style={{ padding: 0 }}>
                <span className="c-secondary">
                  No keys found.<span className="cursor-blink"></span>
                </span>
              </div>
            )}
            {overviewKeys.map((k: any, index: number) => {
              const isLast = index === overviewKeys.length - 1;
              return (
                <div
                  key={k.id}
                  className="row"
                  style={{
                    gridTemplateColumns: '1fr auto',
                    padding: '10px 0',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div className="c-strong">{k.name}</div>
                    <div className="c-secondary mono">{k.key_prefix}</div>
                  </div>
                  <div className="c-secondary c-right">
                    created {new Date(k.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
