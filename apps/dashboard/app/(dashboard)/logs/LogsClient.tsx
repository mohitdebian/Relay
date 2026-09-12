'use client';

import React, { useState, useMemo } from 'react';
import { FilterDropdown } from '@/app/components/FilterDropdown';

export default function LogsClient({ initialLogs }: { initialLogs: any[] }) {
  const [apiFilter, setApiFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      // API Filter: path includes api name (dummy logic)
      if (apiFilter !== 'all' && !log.path.includes(apiFilter)) return false;

      // Method Filter
      if (methodFilter !== 'all' && log.method.toUpperCase() !== methodFilter.toUpperCase()) return false;

      // Status Filter
      if (statusFilter !== 'all') {
        const isSuccess = log.status >= 200 && log.status < 300;
        if (statusFilter === 'success' && !isSuccess) return false;
        if (statusFilter === 'error' && isSuccess) return false;
      }

      return true;
    });
  }, [initialLogs, apiFilter, methodFilter, statusFilter]);

  const apiOptions = [
    { label: 'All APIs', value: 'all' },
    { label: 'Workspaces', value: 'workspaces' },
    { label: 'Auth', value: 'auth' },
    { label: 'Users', value: 'users' },
  ];

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

  return (
    <>
      <div className="filter-bar">
        <FilterDropdown 
          label="API" 
          value={apiFilter} 
          onChange={setApiFilter} 
          options={apiOptions} 
        />
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
        <div className="row row-head" style={{ gridTemplateColumns: '80px 70px 1.6fr 70px 70px' }}>
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
            style={{ gridTemplateColumns: '80px 70px 1.6fr 70px 70px' }}
          >
            <span className="c-secondary mono">{log.time}</span>
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
  );
}
