'use client';

import { useState } from 'react';
import { Dropdown } from './Dropdown';

export default function TestConsole({ apiSlug, keys }: { apiSlug: string, keys: any[] }) {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/');
  const [rawKey, setRawKey] = useState('');
  const [reqBody, setReqBody] = useState('{\n  \n}');
  
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(0);

  const gatewayUrl = (process.env.NEXT_PUBLIC_GATEWAY_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://your-gateway.com' : 'http://127.0.0.1:8080')).replace(/\/$/, '');

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const targetUrl = `${gatewayUrl}/${apiSlug}${path.startsWith('/') ? path : '/' + path}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (rawKey) {
        headers['Authorization'] = `Bearer ${rawKey}`;
      }

      // Route through our server-side proxy to avoid CORS issues
      const res = await fetch('/api/proxy-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url: targetUrl,
          headers,
          body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && reqBody.trim() ? reqBody : undefined,
        }),
      });

      const data = await res.json();
      setLatency(data.latency || 0);
      setResponse({
        status: data.status,
        headers: data.headers || {},
        body: data.body
      });
    } catch (e: any) {
      setLatency(0);
      setResponse({
        status: 'Error',
        body: e.message
      });
    }
    setLoading(false);
  };

  return (
    <div className="panel" style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1.5fr' }}>
        <div>
          <div className="field">
            <label>Method</label>
            <Dropdown
              value={method}
              onChange={setMethod}
              options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' }
              ]}
            />
          </div>
          <div className="field">
            <label>Path</label>
            <input type="text" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/api/users" />
          </div>
          <div className="field">
            <label>API Key (Bearer Token)</label>
            <input type="text" value={rawKey} onChange={(e) => setRawKey(e.target.value)} placeholder="rly_live_..." />
            <div className="hint" style={{ marginTop: '8px' }}>Paste the raw key you generated earlier.</div>
          </div>
          {['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && (
            <div className="field">
              <label>Request Body (JSON)</label>
              <textarea 
                value={reqBody} 
                onChange={(e) => setReqBody(e.target.value)} 
                className="mono" 
                style={{ 
                  width: '100%', 
                  height: '120px', 
                  background: 'var(--bg)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)', 
                  padding: '10px',
                  fontSize: '13px',
                  resize: 'vertical'
                }} 
              />
            </div>
          )}
          <button className="btn btn-primary" onClick={sendRequest} disabled={loading} style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
        
        <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '300px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Response</span>
            {response && (
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span className={response.status >= 400 || response.status === 'Error' ? 'red' : 'green'}>Status: {response.status}</span>
                <span className="c-secondary">Time: {latency}ms</span>
              </div>
            )}
          </div>
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            {!response && !loading && <span className="c-secondary" style={{ fontSize: '13px' }}>Click 'Send Request' to test this API.</span>}
            {loading && <span className="c-secondary" style={{ fontSize: '13px' }}>Awaiting response...</span>}
            {response && (
              <pre className="mono" style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : response.body}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
