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
    ipAddress?: string;
    userAgent?: string;
    requestHeaders?: any;
    responseHeaders?: any;
  } | null;
}

export default function Drawer({ open, onClose, log }: DrawerProps) {
  return (
    <>
      <div className={`drawer-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-head">
          <div className="drawer-title mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log ? `${log.method} ${log.path}` : ''}>
            {log ? `${log.method} ${log.path}` : ''}
          </div>
          <button className="drawer-close" onClick={onClose} style={{ flexShrink: 0, marginLeft: '12px' }}>
            &times;
          </button>
        </div>
        {log && (
          <>
            <div className="drawer-section">
              <div className="drawer-section-title">REQUEST</div>
              <div className="kv">
                <span className="k">Timestamp</span>
                <span className="v">{log.time}</span>
              </div>
              <div className="kv">
                <span className="k">Method</span>
                <span className="v">{log.method}</span>
              </div>
              <div className="kv">
                <span className="k">Path</span>
                <span className="v" style={{ wordBreak: 'break-all' }}>{log.path}</span>
              </div>
              {log.ipAddress && (
                <div className="kv">
                  <span className="k">IP Address</span>
                  <span className="v">{log.ipAddress}</span>
                </div>
              )}
              {log.userAgent && (
                <div className="kv">
                  <span className="k">User Agent</span>
                  <span className="v" style={{ wordBreak: 'break-all' }}>{log.userAgent}</span>
                </div>
              )}
            </div>
            {(log.requestHeaders || log.responseHeaders) && (
              <div className="drawer-section">
                <div className="drawer-section-title">HEADERS</div>
                {log.requestHeaders && (
                  <div style={{ marginBottom: '12px' }}>
                    <div className="c-label" style={{ marginBottom: '4px' }}>REQUEST HEADERS</div>
                    <div className="code-block" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {typeof log.requestHeaders === 'string'
                        ? (() => {
                            try {
                              return JSON.stringify(JSON.parse(log.requestHeaders), null, 2);
                            } catch {
                              return log.requestHeaders;
                            }
                          })()
                        : JSON.stringify(log.requestHeaders, null, 2)}
                    </div>
                  </div>
                )}
                {log.responseHeaders && (
                  <div>
                    <div className="c-label" style={{ marginBottom: '4px' }}>RESPONSE HEADERS</div>
                    <div className="code-block" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {typeof log.responseHeaders === 'string'
                        ? (() => {
                            try {
                              return JSON.stringify(JSON.parse(log.responseHeaders), null, 2);
                            } catch {
                              return log.responseHeaders;
                            }
                          })()
                        : JSON.stringify(log.responseHeaders, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            )}
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
          </>
        )}
      </div>
    </>
  );
}
