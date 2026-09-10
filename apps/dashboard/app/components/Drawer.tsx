'use client';

import { useState } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  log: {
    method: string;
    path: string;
    time: string;
    status: number;
    latency: string;
  } | null;
}

export default function Drawer({ open, onClose, log }: DrawerProps) {
  return (
    <>
      <div className={`drawer-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-head">
          <div className="drawer-title mono">{log ? `${log.method} ${log.path}` : ''}</div>
          <button className="drawer-close" onClick={onClose}>
            &times;
          </button>
        </div>
        {log && (
          <>
            <div className="drawer-section">
              <div className="drawer-section-title">REQUEST</div>
              <div className="kv">
                <span className="k">Timestamp</span>
                <span className="v">2026-09-09 {log.time}</span>
              </div>
              <div className="kv">
                <span className="k">Method</span>
                <span className="v">{log.method}</span>
              </div>
              <div className="kv">
                <span className="k">Path</span>
                <span className="v">{log.path}</span>
              </div>
              <div className="kv">
                <span className="k">Query</span>
                <span className="v">?limit=50&sort=-created</span>
              </div>
            </div>
            <div className="drawer-section">
              <div className="drawer-section-title">HEADERS</div>
              <div className="code-block">
                {`Authorization: Bearer sk_live_••••••••••••\nUser-Agent: acme-web/2.4.1\nAccept: application/json`}
              </div>
            </div>
            <div className="drawer-section">
              <div className="drawer-section-title">RESPONSE</div>
              <div className="kv">
                <span className="k">Status</span>
                <span
                  className="v"
                  style={{
                    color: log.status < 400 ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {log.status}
                </span>
              </div>
              <div className="kv">
                <span className="k">Latency</span>
                <span className="v">{log.latency}</span>
              </div>
            </div>
            <div className="drawer-section">
              <div className="drawer-section-title">RESPONSE BODY</div>
              <div className="code-block">
                {log.status >= 400
                  ? `{\n  "error": "internal_error",\n  "message": "upstream database timeout"\n}`
                  : `{\n  "data": [...],\n  "meta": { "total": 142, "page": 1 }\n}`}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
