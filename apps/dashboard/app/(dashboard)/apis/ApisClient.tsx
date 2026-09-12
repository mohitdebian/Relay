'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FilterDropdown } from '@/app/components/FilterDropdown';

export default function ApisClient({ initialApis }: { initialApis: any[] }) {
  const [envFilter, setEnvFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredApis = useMemo(() => {
    return initialApis.filter((api) => {
      const apiEnv = (api.environment || '').toLowerCase();
      if (envFilter !== 'all' && apiEnv !== envFilter.toLowerCase()) return false;

      // Since all APIs seem to be REST v1 for now, we'll dummy out type filter unless needed.
      if (typeFilter !== 'all' && typeFilter !== 'rest') return false;

      const apiStatus = (api.status || 'active').toLowerCase();
      if (statusFilter !== 'all' && apiStatus !== statusFilter) return false;

      return true;
    });
  }, [initialApis, envFilter, typeFilter, statusFilter]);

  const envOptions = [
    { label: 'All Environments', value: 'all' },
    { label: 'Production', value: 'production' },
    { label: 'Staging', value: 'staging' },
    { label: 'Development', value: 'development' },
  ];

  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'REST', value: 'rest' },
    { label: 'GraphQL', value: 'graphql' },
    { label: 'WebSocket', value: 'websocket' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Healthy', value: 'active' },
    { label: 'Degraded', value: 'degraded' },
  ];

  return (
    <>
      <div className="filter-bar">
        <FilterDropdown
          label="Environment"
          value={envFilter}
          onChange={setEnvFilter}
          options={envOptions}
        />
        <FilterDropdown
          label="Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </div>

      <div className="panel">
        {filteredApis.length === 0 && (
          <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
            No APIs found matching filters.<span className="cursor-blink"></span>
          </div>
        )}
        {filteredApis.map((api: any) => (
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
    </>
  );
}
