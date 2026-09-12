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

  let successRate: number | null = null;
  let successRateColor = '';
  let lowVolume = false;

  if (analyticsOverview) {
    if (analyticsOverview.totalRequests > 0) {
      successRate =
        ((analyticsOverview.totalRequests - analyticsOverview.totalErrors) /
          analyticsOverview.totalRequests) *
        100;
      if (successRate >= 99) successRateColor = 'green';
      else if (successRate >= 95) successRateColor = 'yellow';
      else successRateColor = 'red';
    }
    lowVolume = analyticsOverview.totalRequests < 20;
  }

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

  let lastUpdatedText = 'last updated just now';
  if (apis.length > 0) {
    const latestUpdate = apis.reduce((latest: Date, api: any) => {
      const apiDate = new Date(api.updated_at || api.created_at);
      return apiDate > latest ? apiDate : latest;
    }, new Date(0));
    
    const diff = Date.now() - latestUpdate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) lastUpdatedText = `last updated ${days} day${days === 1 ? '' : 's'} ago`;
    else if (hours > 0) lastUpdatedText = `last updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
    else if (minutes > 0) lastUpdatedText = `last updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    else lastUpdatedText = 'last updated just now';
  } else {
    lastUpdatedText = 'no APIs yet';
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            <Typewriter text="OVERVIEW" />
          </div>
          <div className="page-sub">{apis.length} {apis.length === 1 ? 'API' : 'APIs'} · {lastUpdatedText}</div>
        </div>
        <NewApiButton />
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Requests (24h)</div>
          <div className="stat-value">
            {analyticsOverview ? analyticsOverview.totalRequests : '---'}
          </div>
          <div className="stat-delta">
            {!analyticsOverview ? (
              'N/A'
            ) : lowVolume ? (
              <span className="c-secondary">not enough data for a trend</span>
            ) : analyticsOverview.totalRequestsDelta !== undefined ? (
              <span className={analyticsOverview.totalRequestsDelta >= 0 ? 'green' : 'red'}>
                {analyticsOverview.totalRequestsDelta > 0 ? '+' : ''}
                {analyticsOverview.totalRequestsDelta}%
              </span>
            ) : (
              'N/A'
            )}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Success rate</div>
          <div className={`stat-value ${successRateColor}`}>
            {successRate !== null ? Math.round(successRate) + '%' : '---'}
          </div>
          <div className="stat-delta">
            {!analyticsOverview ? (
              'N/A'
            ) : lowVolume ? (
              <span className="c-secondary">
                {analyticsOverview.totalErrors} of {analyticsOverview.totalRequests} failed
              </span>
            ) : analyticsOverview.successRateDelta !== undefined ? (
              <span className={analyticsOverview.successRateDelta >= 0 ? 'green' : 'red'}>
                {analyticsOverview.successRateDelta > 0 ? '+' : ''}
                {analyticsOverview.successRateDelta}%
              </span>
            ) : (
              'N/A'
            )}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">p95 latency</div>
          <div className="stat-value">
            {analyticsOverview ? analyticsOverview.averageLatencyMs + 'ms' : '---'}
          </div>
          <div className="stat-delta">
            {!analyticsOverview ? (
              'N/A'
            ) : lowVolume ? (
              <span className="c-secondary">not enough data for a trend</span>
            ) : analyticsOverview.averageLatencyDelta !== undefined ? (
              <span className={analyticsOverview.averageLatencyDelta <= 0 ? 'green' : 'red'}>
                {analyticsOverview.averageLatencyDelta > 0 ? '+' : ''}
                {analyticsOverview.averageLatencyDelta}%
              </span>
            ) : (
              'N/A'
            )}
          </div>
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
                  className={`dot ${(api.status?.toLowerCase() || 'active') === 'active' ? 'green' : 'yellow'}`}
                ></span>
                {(api.status?.toLowerCase() || 'active') === 'active' ? 'Healthy' : 'Degraded'}
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
                <span className="c-secondary mono" style={{ whiteSpace: 'nowrap' }}>
                  {log.time.replace(/:\d{2}(?=\s|$)/, '')}
                </span>
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
