"use client";

import React, { useState } from 'react';

type ChangeType = 'ADDED' | 'FIXED' | 'IMPROVED' | 'BREAKING';
type Area = 'API' | 'Dashboard' | 'Core';

interface Change {
  type: ChangeType;
  area: Area;
  text: React.ReactNode;
}

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: Change[];
}

const entries: ChangelogEntry[] = [
  {
    version: 'v2.4.0',
    date: '2026-09-11',
    title: 'Advanced Rate Limiting',
    changes: [
      { type: 'ADDED', area: 'API', text: 'Added support for IP-based and header-based rate limiting rules.' },
      { type: 'ADDED', area: 'API', text: <>New <code className="docs-inline">/v1/policies</code> API endpoint to programmatically manage rate limit rules.</> },
      { type: 'FIXED', area: 'Dashboard', text: 'Fixed an issue where the dashboard would show healthy APIs as degraded under certain edge cases.' },
    ],
  },
  {
    version: 'v2.3.0',
    date: '2026-08-24',
    title: 'Webhook Signatures & Retries',
    changes: [
      { type: 'IMPROVED', area: 'API', text: <>All outbound webhooks now include an <code className="docs-inline">x-relay-signature</code> header using HMAC SHA-256.</> },
      { type: 'IMPROVED', area: 'Core', text: 'Failed webhooks now automatically retry with exponential backoff up to 5 times over 3 hours.' },
      { type: 'BREAKING', area: 'API', text: 'Legacy un-signed webhook endpoints will be deprecated in v3.0.' }
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-08-01',
    title: 'Initial Public Beta',
    changes: [
      { type: 'ADDED', area: 'Core', text: 'Launched the Relay Gateway and Dashboard.' },
      { type: 'ADDED', area: 'API', text: 'Support for dynamic routing, basic API key authentication, and traffic observability.' },
    ],
  },
];

const FILTERS = ['All', 'API', 'Dashboard', 'Breaking'];

export default function ChangelogPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredEntries = entries.map(entry => {
    if (activeFilter === 'All') return entry;
    
    const filteredChanges = entry.changes.filter(c => {
      if (activeFilter === 'Breaking') return c.type === 'BREAKING';
      return c.area === activeFilter;
    });

    return { ...entry, changes: filteredChanges };
  }).filter(entry => entry.changes.length > 0);

  return (
    <main className="docs-main changelog-page">
      <div className="docs-breadcrumb">Updates</div>
      <div className="changelog-header-row">
        <h1 className="docs-h1" style={{ marginBottom: 0 }}>Changelog</h1>
      </div>

      <p className="docs-lede">
        New features, fixes, and improvements to the Relay platform and API.
      </p>

      <div className="changelog-filters-row">
        <div className="changelog-filters">
          {FILTERS.map(f => (
            <button 
              key={f}
              className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="changelog-timeline">
        {filteredEntries.map((entry, idx) => (
          <div key={idx} className="changelog-entry">
            <div className="changelog-meta">
              <span className="changelog-date mono muted">{entry.date}</span>
              <span className="changelog-version mono muted">{entry.version}</span>
            </div>
            
            <div className="changelog-dot-container">
              <div className={`changelog-dot ${idx === 0 && activeFilter === 'All' ? 'active' : ''}`}></div>
              <div className="changelog-line"></div>
            </div>
            
            <div className="changelog-content">
              <h2 className="docs-h2">{entry.title}</h2>
              <div className="changelog-changes">
                {entry.changes.map((change, cidx) => (
                  <div key={cidx} className="change-line">
                    <span className={`change-tag ${change.type.toLowerCase()}`}>
                      {change.type}
                    </span>
                    <span className="change-text">{change.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
