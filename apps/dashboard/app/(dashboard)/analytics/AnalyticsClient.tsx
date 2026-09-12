'use client';

import React, { useState, useMemo } from 'react';
import { FilterDropdown } from '@/app/components/FilterDropdown';

export default function AnalyticsClient({ analytics }: { analytics: any }) {
  const [apiFilter, setApiFilter] = useState('all');
  const [keyFilter, setKeyFilter] = useState('all');
  const [endpointFilter, setEndpointFilter] = useState('all');
  const [envFilter, setEnvFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all_time');

  const initialByEndpoint = analytics?.byEndpoint || [];
  const initialByKey = analytics?.byKey || [];

  const filteredByEndpoint = useMemo(() => {
    return initialByEndpoint.filter((e: any) => {
      if (endpointFilter !== 'all' && !e.path.includes(endpointFilter)) return false;
      if (statusFilter === 'error' && e.errors === 0) return false;
      if (statusFilter === 'success' && e.errors > 0) return false;
      return true;
    });
  }, [initialByEndpoint, endpointFilter, statusFilter]);

  const filteredByKey = useMemo(() => {
    return initialByKey.filter((k: any) => {
      if (keyFilter !== 'all' && !k.name.includes(keyFilter)) return false;
      return true;
    });
  }, [initialByKey, keyFilter]);

  const totalRequests = analytics?.overview?.totalRequests || 0;
  const successRate =
    totalRequests === 0
      ? 'N/A'
      : (((totalRequests - (analytics?.overview?.totalErrors || 0)) / totalRequests) * 100).toFixed(
          2
        ) + '%';
  const avgLatency = analytics?.overview?.averageLatencyMs || 0;

  return (
    <>
      <div className="filter-bar">
        <FilterDropdown
          label="API"
          value={apiFilter}
          onChange={setApiFilter}
          options={[
            { label: 'All APIs', value: 'all' },
            { label: 'Auth API', value: 'auth' },
          ]}
        />
        <FilterDropdown
          label="API Key"
          value={keyFilter}
          onChange={setKeyFilter}
          options={[
            { label: 'All Keys', value: 'all' },
            { label: 'Production', value: 'prod' },
            { label: 'Test', value: 'test' },
          ]}
        />
        <FilterDropdown
          label="Endpoint"
          value={endpointFilter}
          onChange={setEndpointFilter}
          options={[
            { label: 'All Endpoints', value: 'all' },
            { label: '/api/v1/auth', value: 'auth' },
            { label: '/api/v1/users', value: 'users' },
          ]}
        />
        <FilterDropdown
          label="Environment"
          value={envFilter}
          onChange={setEnvFilter}
          options={[
            { label: 'All Environments', value: 'all' },
            { label: 'Production', value: 'production' },
            { label: 'Staging', value: 'staging' },
          ]}
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All Statuses', value: 'all' },
            { label: 'Success', value: 'success' },
            { label: 'With Errors', value: 'error' },
          ]}
        />
        <FilterDropdown
          label="Time"
          value={timeFilter}
          onChange={setTimeFilter}
          options={[
            { label: 'All Time', value: 'all_time' },
            { label: 'Last 24h', value: '24h' },
            { label: 'Last 7d', value: '7d' },
            { label: 'Last 30d', value: '30d' },
          ]}
        />
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
          {(!filteredByEndpoint || filteredByEndpoint.length === 0) && (
            <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
              No traffic recorded matching filters.<span className="cursor-blink"></span>
            </div>
          )}
          {filteredByEndpoint.map((e: any) => (
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
          {(!filteredByKey || filteredByKey.length === 0) && (
            <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
              No API keys matching filters.<span className="cursor-blink"></span>
            </div>
          )}
          {filteredByKey.map((k: any) => (
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
